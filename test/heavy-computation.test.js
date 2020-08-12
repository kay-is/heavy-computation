const { expect, haveResource } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const HeavyComputation = require('../lib/heavy-computation-stack');

test('SQS Queue Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new HeavyComputation.HeavyComputationStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(haveResource("AWS::SQS::Queue",{
      VisibilityTimeout: 300
    }));
});

test('SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new HeavyComputation.HeavyComputationStack(app, 'MyTestStack');
  // THEN
  expect(stack).to(haveResource("AWS::SNS::Topic"));
});
