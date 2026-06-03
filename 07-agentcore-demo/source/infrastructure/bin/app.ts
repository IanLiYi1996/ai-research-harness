#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { AgentStack } from '../lib/agent-stack';
import { IdentityStack } from '../lib/identity-stack';
import { WebStack } from '../lib/web-stack';

const app = new App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-west-2',
};

const agent = new AgentStack(app, 'ResearchCopilotAgent', { env });
const identity = new IdentityStack(app, 'ResearchCopilotIdentity', {
  env,
  runtimeArn: agent.runtimeArn,
});
new WebStack(app, 'ResearchCopilotWeb', {
  env,
  runtimeArn: agent.runtimeArn,
  identityPoolId: identity.identityPoolId,
});
