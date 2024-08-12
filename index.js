const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const secretsManager = new AWS.SecretsManager();
const sqs = new AWS.SQS();
const eventBridge = new AWS.EventBridge();
const stepFunctions = new AWS.StepFunctions();

exports.handler = async (event) => {
  try {
    const secret = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_NAME }).promise();
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'example.txt',
      Body: 'Hello World'
    }).promise();
    await sqs.sendMessage({
      QueueUrl: process.env.SQS_QUEUE_URL,
      MessageBody: 'Hello World'
    }).promise();
    await eventBridge.putEvents({
      Entries: [{
        Source: 'my.source',
        DetailType: 'my.detail.type',
        Detail: JSON.stringify({ message: 'Hello World' }),
        EventBusName: process.env.EVENT_BUS_NAME
      }]
    }).promise();
    await stepFunctions.startExecution({
      stateMachineArn: process.env.STEP_FUNCTION_ARN,
      name: 'execution-name',
      input: JSON.stringify({ message: 'Hello World' })
    }).promise();

    return {
      statusCode: 200,
      body: 'Success'
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};
