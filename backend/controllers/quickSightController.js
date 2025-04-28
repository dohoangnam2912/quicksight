// const { quickSightClient } = require('../configs/awsConfig');
const mongoClient = require('../configs/mongoDBConfig');
const { GenerateEmbedUrlForRegisteredUserCommand } = require('@aws-sdk/client-quicksight');
const { QuickSightClient } = require('@aws-sdk/client-quicksight');

const quickSightClient = new QuickSightClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
// MongoDB collections
const db = mongoClient.db('quickSightDB'); // Replace with your database name
const sessionsCollection = db.collection('sessions');
const queriesCollection = db.collection('queries');
const dashboardsCollection = db.collection('dashboards');

// Generate QuickSight Embed URL for the Q Search Bar
async function generateEmbedUrl(req, res) {
  const accountId = process.env.AWS_ACCOUNT_ID;
  const region = process.env.AWS_REGION;
  const userName = process.env.QUICKSIGHT_USER_NAME;
  const topicId = process.env.QUICKSIGHT_TOPIC_ID;
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];

  const userArn = `arn:aws:quicksight:${region}:${accountId}:user/default/${userName}`;
  const params = {
    AwsAccountId: accountId,
    UserArn: userArn,
    ExperienceConfiguration: {
      GenerativeQnA: {
        InitialTopicId: topicId,  // This is for Generative QnA
      },
    },
    SessionLifetimeInMinutes: 600,  
    ...(allowedDomains.length && { AllowedDomains: allowedDomains }),
  };

  try {
    // Ensure quickSightClient is correctly being used to send the command
    const command = new GenerateEmbedUrlForRegisteredUserCommand(params);
    const response = await quickSightClient.send(command);  // Proper usage of send
    res.json({ embedUrl: response.EmbedUrl });
  } catch (error) {
    console.error('Error generating embed URL:', error);
    res.status(500).json({ error: error.message || 'Failed to get embed URL' });
  }
}

// Fetch and update user context (queries and dashboards) from MongoDB
async function rewriteQuery(req, res) {
  const { userId, sessionId, query } = req.body;

  try {
    // Retrieve user session context from MongoDB
    const session = await sessionsCollection.findOne({ userId: userId, sessionId: sessionId });

    if (!session) {
      return res.status(400).json({ error: 'No context found for this session' });
    }

    const dashboardContext = session.dashboardContext || null;
    let rewrittenQuery = query;

    if (dashboardContext && query.toLowerCase().includes('bred')) {
      const month = dashboardContext.filters.month;
      rewrittenQuery = `${query} in the sales data for ${month}`;
    }

    // Store the rewritten query in MongoDB
    await sessionsCollection.updateOne(
      { userId: userId, sessionId: sessionId },
      { $set: { lastQuery: rewrittenQuery } }
    );

    res.json({ rewrittenQuery });
  } catch (error) {
    console.error('Error rewriting query:', error);
    res.status(500).json({ error: error.message });
  }
}



module.exports = { generateEmbedUrl, rewriteQuery };
