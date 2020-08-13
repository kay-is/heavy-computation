const path = require("path");

const cdk = require("@aws-cdk/core");
const s3 = require("@aws-cdk/s3");
const apigateway = require("@aws-cdk/apigateway");
const lambda = require("@aws-cdk/lambda");
const lambdaEventSources = require("@aws-cdk/lambda-event-sources");
const iam = require("@aws-cdk/iam");

class HeavyComputationStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const tasksBucket = this.createS3Bucket("tasks");
    const resultsBucket = this.createS3Bucket("results");

    const backendFunction = this.createLambdaFunction("backend", {
      TASKS_BUCKET_NAME: tasksBucket.bucketName,
    });
    const calculatorFunction = this.createLambdaFunction("calculator", {
      TASKS_BUCKET_NAME: tasksBucket.bucketName,
      RESULTS_BUCKET_NAME: resultsBucket.bucketName,
    });

    const sendEmailRole = this.createSendEmailRole();
    const emailFunction = this.createLambdaFunction("email", {}, sendEmailRole);

    tasksBucket.grantWrite(backendFunction);
    tasksBucket.grantRead(calculatorFunction);
    this.addS3CreateObjectEventSource(calculatorFunction, tasksBucket);

    resultsBucket.grantWrite(calculatorFunction);
    resultsBucket.grantRead(emailFunction);
    this.addS3CreateObjectEventSource(emailFunction, resultsBucket);

    new apigateway.LambdaRestApi(this, "api", { handler: backendFunction });
  }

  createLambdaFunction(file, environment, role) {
    return new lambda.Function(this, file, {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "functions", file)),
      environment,
      role,
    });
  }

  createS3Bucket(name) {
    return new s3.Bucket(this, name);
  }

  addS3CreateObjectEventSource(lambda, bucket) {
    return lambda.addEventSource(
      new lambdaEventSources.S3EventSource(bucket, {
        events: [s3.EventType.OBJECT_CREATED],
      })
    );
  }

  createSendEmailRole() {
    const role = new iam.Role(this, "mailsender", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        action: ["ses:SendEmail", "ses:SendRawEmail"],
        resource: ["*"],
      })
    );

    return role;
  }
}

module.exports = { HeavyComputationStack };
