import * as path from 'path';
import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface WebAppStackProps extends StackProps {
  readonly runtimeArn: string;
}

/**
 * The whole browser-facing tier in one stack: CloudFront-hosted SPA, a Cognito
 * User Pool with Hosted UI for login, and a streaming relay Lambda that
 * verifies the Cognito JWT then proxies SSE from AgentCore (which is itself
 * CORS-less and streaming-only, so a browser cannot call it directly).
 *
 * Everything lives in one stack because the pieces form a dependency DAG around
 * the CloudFront domain (callback URL, CORS origin) — splitting them across
 * stacks would create a CloudFormation export cycle.
 */
export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props: WebAppStackProps) {
    super(scope, id, props);

    // --- Relay Lambda (streaming) + IAM-protected Function URL ---
    // This account blocks public (AuthType=NONE) Function URLs via SCP, so the
    // URL is AWS_IAM and CloudFront signs to it via OAC (below). App-level auth
    // is the Cognito JWT check inside the handler.
    const relay = new NodejsFunction(this, 'RelayFn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../lambda/relay/index.mjs'),
      handler: 'handler',
      timeout: Duration.minutes(5),
      memorySize: 512,
      bundling: {
        format: 'esm' as any,
        nodeModules: ['@aws-sdk/client-bedrock-agentcore', 'aws-jwt-verify'],
        banner:
          "import{createRequire}from'module';const require=createRequire(import.meta.url);",
      },
      environment: {
        RUNTIME_ARN: props.runtimeArn,
        // USER_POOL_ID / USER_POOL_CLIENT_ID injected after the pool exists.
      },
    });
    relay.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['bedrock-agentcore:InvokeAgentRuntime'],
        // InvokeAgentRuntime targets the endpoint sub-resource
        // (…/runtime/<id>/runtime-endpoint/DEFAULT), not just the bare runtime ARN.
        resources: [props.runtimeArn, `${props.runtimeArn}/runtime-endpoint/*`],
      }),
    );
    const relayUrl = relay.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
      invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
    });

    // --- Static hosting + CloudFront (S3 default, /api/* → relay via OAC) ---
    const bucket = new s3.Bucket(this, 'WebBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // OAC that SigV4-signs CloudFront→Lambda-URL requests (lambda service).
    const relayOac = new cloudfront.FunctionUrlOriginAccessControl(this, 'RelayOac', {
      signing: cloudfront.Signing.SIGV4_ALWAYS,
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        'api/*': {
          origin: origins.FunctionUrlOrigin.withOriginAccessControl(relayUrl, {
            originAccessControl: relayOac,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          // Forward the Authorization header (Cognito JWT) without caching.
          // CloudFront requires Authorization to be forwarded via a CachePolicy
          // (not an OriginRequestPolicy), so we build a no-cache policy here.
          cachePolicy: new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
            defaultTtl: Duration.seconds(0),
            minTtl: Duration.seconds(0),
            maxTtl: Duration.seconds(1),
            headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Authorization'),
            enableAcceptEncodingGzip: false,
          }),
        },
      },
      defaultRootObject: 'index.html',
    });
    const webUrl = `https://${distribution.distributionDomainName}`;

    // Let CloudFront (this distribution) invoke the IAM-protected Function URL.
    relay.addPermission('AllowCloudFrontInvokeUrl', {
      principal: new iam.ServicePrincipal('cloudfront.amazonaws.com'),
      action: 'lambda:InvokeFunctionUrl',
      functionUrlAuthType: lambda.FunctionUrlAuthType.AWS_IAM,
      sourceArn: `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
    });

    // --- Cognito User Pool + Hosted UI ---
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'research_copilot_users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: { minLength: 8, requireDigits: true, requireLowercase: true },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const client = userPool.addClient('WebClient', {
      userPoolClientName: 'research_copilot_web',
      generateSecret: false, // public SPA client (PKCE)
      authFlows: { userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: [webUrl, 'http://localhost:5173'],
        logoutUrls: [webUrl, 'http://localhost:5173'],
      },
    });

    userPool.addDomain('HostedUiDomain', {
      cognitoDomain: { domainPrefix: `research-copilot-${this.account}` },
    });
    const cognitoDomain = `https://research-copilot-${this.account}.auth.${this.region}.amazoncognito.com`;

    // Wire the User Pool id into the relay for JWT verification. We inject only
    // USER_POOL_ID (the issuer): it depends on UserPool, which does NOT depend
    // on the distribution — so no dependency cycle. The client id is
    // deliberately NOT injected — that edge (relay → client → distribution →
    // relayUrl → relay) would cycle. The relay verifies issuer + access-token
    // type, which is sufficient here since only our pool can mint these tokens.
    relay.addEnvironment('USER_POOL_ID', userPool.userPoolId);

    // --- Front-end runtime config (read by the SPA at load) ---
    // The browser calls same-origin /api (no CORS, no public URL).
    const config = {
      relayUrl: '/api',
      region: this.region,
      userPoolClientId: client.userPoolClientId,
      cognitoDomain,
      redirectUri: webUrl,
    };

    new s3deploy.BucketDeployment(this, 'DeployWeb', {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, '../../web')),
        s3deploy.Source.jsonData('config.json', config),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new CfnOutput(this, 'WebUrl', { value: webUrl });
    new CfnOutput(this, 'CognitoDomain', { value: cognitoDomain });
    new CfnOutput(this, 'UserPoolClientId', { value: client.userPoolClientId });
  }
}
