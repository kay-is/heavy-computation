const sns = require('@aws-cdk/aws-sns');
const subs = require('@aws-cdk/aws-sns-subscriptions');
const sqs = require('@aws-cdk/aws-sqs');
const cdk = require('@aws-cdk/core');

class HeavyComputationStack extends cdk.Stack {
  /**
   * @param {cdk.App} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'HeavyComputationQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'HeavyComputationTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));
  }
}

module.exports = { HeavyComputationStack }
