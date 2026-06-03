import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from 'https://esm.sh/@aws-sdk/client-bedrock-agentcore@3';
import {
  CognitoIdentityClient,
} from 'https://esm.sh/@aws-sdk/client-cognito-identity@3';
import {
  fromCognitoIdentityPool,
} from 'https://esm.sh/@aws-sdk/credential-provider-cognito-identity@3';

const tiles = {
  pipeline: document.getElementById('pipeline'),
  memory: document.getElementById('memory'),
  sandbox: document.getElementById('sandbox'),
};

function append(tile, text) {
  tiles[tile].textContent += text;
}

function route(text) {
  // Lightweight routing of streamed text into tiles by marker.
  if (text.includes('activated skill') || /step\s*\d/i.test(text)) append('pipeline', text);
  else if (/score|recall|remember|memory/i.test(text)) append('memory', text);
  else if (/accuracy|=|stdout|sandbox|plot/i.test(text)) append('sandbox', text);
  else append('pipeline', text);
}

async function main() {
  const cfg = await (await fetch('./config.json')).json();
  const credentials = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: cfg.region }),
    identityPoolId: cfg.identityPoolId,
  });
  const client = new BedrockAgentCoreClient({ region: cfg.region, credentials });

  document.getElementById('go').onclick = async () => {
    for (const t of Object.values(tiles)) t.textContent = '';
    const prompt = document.getElementById('prompt').value;
    const sessionId = document.getElementById('session').value || 'booth-1';
    const payload = new TextEncoder().encode(JSON.stringify({ prompt, session_id: sessionId }));
    const resp = await client.send(
      new InvokeAgentRuntimeCommand({
        agentRuntimeArn: cfg.runtimeArn,
        runtimeSessionId: sessionId.padEnd(33, '0'),
        payload,
      }),
    );
    // response.response is a streaming byte source; decode incrementally.
    // Buffer across chunks so a line split mid-boundary isn't parsed as
    // garbage — only complete (newline-terminated) lines are dispatched.
    const decoder = new TextDecoder();
    let buf = '';
    const handleLine = (line) => {
      const m = line.match(/^data:\s*(.*)$/);
      if (!m || m[1] === '[DONE]') return;
      try { route(JSON.parse(m[1]).text ?? ''); }
      catch { route(m[1]); }
    };
    for await (const chunk of resp.response) {
      buf += decoder.decode(chunk, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? ''; // keep the trailing partial line in the buffer
      for (const line of lines) handleLine(line);
    }
    if (buf) handleLine(buf); // flush any final unterminated line
  };
}

main().catch((e) => append('pipeline', 'Init error: ' + e.message));
