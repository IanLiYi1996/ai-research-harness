/**
 * Browser → AgentCore relay (Lambda Function URL, response streaming).
 *
 * Why this exists: the AgentCore data-plane endpoint returns no CORS headers
 * and streams text/event-stream, so a browser cannot call InvokeAgentRuntime
 * directly. This Lambda terminates the browser request (with CORS), verifies
 * the caller's Cognito JWT, then invokes the runtime server-side (SigV4, no
 * CORS) and pipes the SSE stream straight back to the browser.
 */
import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from '@aws-sdk/client-bedrock-agentcore';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const REGION = process.env.AWS_REGION || 'us-east-1';
const RUNTIME_ARN = process.env.RUNTIME_ARN;

// Verify Cognito **access** tokens minted for our app client.
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  tokenUse: 'access',
  clientId: process.env.USER_POOL_CLIENT_ID,
});

const client = new BedrockAgentCoreClient({ region: REGION });

/** Pad/normalize a session id to AgentCore's >=33 char requirement. */
function normalizeSessionId(raw) {
  let s = (raw || 'web-session').replace(/[^a-zA-Z0-9_-]/g, '');
  while (s.length < 33) s += '0';
  return s;
}

// CORS (preflight + ACAO) is handled by the Function URL's cors config, so the
// handler only deals with POST.
export const handler = awslambda.streamifyResponse(async (event, responseStream) => {
  const fail = (statusCode, message) => {
    const s = awslambda.HttpResponseStream.from(responseStream, {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
    s.write(JSON.stringify({ error: message }));
    s.end();
  };

  // --- Auth: verify the Cognito JWT from the Authorization header. ---
  const auth = event.headers?.authorization || event.headers?.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return fail(401, 'Missing bearer token');
  let claims;
  try {
    claims = await verifier.verify(token);
  } catch (e) {
    return fail(401, 'Invalid token: ' + e.message);
  }

  // --- Parse body. ---
  let body = {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf-8')
      : event.body;
    body = JSON.parse(raw || '{}');
  } catch {
    return fail(400, 'Invalid JSON body');
  }
  const prompt = body.prompt || '';
  // Bind the AgentCore session to the authenticated user so each visitor gets
  // their own short-term history; the agent's fixed actor still enables recall.
  const sessionId = normalizeSessionId(body.session_id || claims.sub);

  // --- Open the streamed HTTP response to the browser. ---
  const http = awslambda.HttpResponseStream.from(responseStream, {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });

  try {
    const resp = await client.send(
      new InvokeAgentRuntimeCommand({
        agentRuntimeArn: RUNTIME_ARN,
        runtimeSessionId: sessionId,
        contentType: 'application/json',
        payload: new TextEncoder().encode(
          JSON.stringify({ prompt, session_id: sessionId }),
        ),
      }),
    );

    // resp.response is an async iterable of Uint8Array chunks (the SSE body).
    for await (const chunk of resp.response) {
      http.write(chunk);
    }
  } catch (e) {
    http.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
  } finally {
    http.write('data: [DONE]\n\n');
    http.end();
  }
});
