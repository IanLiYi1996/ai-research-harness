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

    // --- Static hosting (created first; its domain is a token others use) ---
    const bucket = new s3.Bucket(this, 'WebBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });
    const webUrl = `https://${distribution.distributionDomainName}`;

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

    // --- Relay Lambda (streaming) + Function URL ---
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
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: client.userPoolClientId,
        ALLOWED_ORIGIN: webUrl,
      },
    });
    relay.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['bedrock-agentcore:InvokeAgentRuntime'],
        resources: [props.runtimeArn],
      }),
    );
    const relayUrl = relay.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // auth = JWT check inside handler
      invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
      // Function URL handles OPTIONS preflight and injects ACAO on responses;
      // more reliable than hand-rolling CORS inside a streaming handler.
      cors: {
        allowedOrigins: [webUrl],
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ['authorization', 'content-type'],
        maxAge: Duration.hours(1),
      },
    });

    // --- Front-end runtime config (read by the SPA at load) ---
    const config = {
      relayUrl: relayUrl.url,
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
    new CfnOutput(this, 'RelayUrl', { value: relayUrl.url });
    new CfnOutput(this, 'CognitoDomain', { value: cognitoDomain });
    new CfnOutput(this, 'UserPoolClientId', { value: client.userPoolClientId });
  }
}
