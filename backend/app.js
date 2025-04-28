// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const quickSightRoutes = require('./routes/quickSightRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests
app.use('/api', quickSightRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});