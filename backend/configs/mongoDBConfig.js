// config/mongoDBConfig.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection
const mongoClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoClient.connect()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = mongoClient;