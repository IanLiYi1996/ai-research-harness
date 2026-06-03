import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { IdentityStack } from '../lib/identity-stack';

test('identity stack scopes invoke to a single runtime arn', () => {
  const app = new App();
  const arn = 'arn:aws:bedrock-agentcore:us-west-2:111111111111:runtime/abc';
  const stack = new IdentityStack(app, 'TestIdentity', {
    runtimeArn: arn,
    env: { account: '111111111111', region: 'us-west-2' },
  });
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::Cognito::IdentityPool', 1);
  template.hasResourceProperties('AWS::Cognito::IdentityPool', {
    AllowUnauthenticatedIdentities: true,
  });
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'bedrock-agentcore:InvokeAgentRuntime',
          Resource: arn,
        }),
      ]),
    },
  });
});
