// Writes a number into a bucket
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const { TASKS_BUCKET_NAME } = process.env;

exports.handler = async ({ body }) => {
  const requestData = JSON.parse(body);

  await s3
    .putObject({
      Bucket: TASKS_BUCKET_NAME,
      Key: Math.random(),
      Body: JSON.stringify({
        number: requestData.number,
        email: requestData.email,
      }),
    })
    .promise();
};
