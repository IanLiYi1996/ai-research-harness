import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebStack } from '../lib/web-stack';

test('web stack provisions a bucket and a cloudfront distribution', () => {
  const app = new App();
  const stack = new WebStack(app, 'TestWeb', {
    runtimeArn: 'arn:aws:bedrock-agentcore:us-west-2:111111111111:runtime/abc',
    identityPoolId: 'us-west-2:pool-id',
    env: { account: '111111111111', region: 'us-west-2' },
  });
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::S3::Bucket', 1);
  template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  const outputs = template.findOutputs('*');
  expect(Object.keys(outputs).some((k) => k.toLowerCase().includes('url'))).toBe(true);
});
