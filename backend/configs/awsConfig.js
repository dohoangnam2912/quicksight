// config/awsConfig.js
require('dotenv').config();
const { QuickSightClient } = require('@aws-sdk/client-quicksight');

const quickSightClient = new QuickSightClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = quickSightClient;
