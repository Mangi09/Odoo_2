const app = require('./app');
const { connectDB } = require('../shared/db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.BE1_PORT || 3001;

async function startServer() {
  try {
    // Establish connection to MongoDB before binding server to port
    await connectDB();
    app.listen(PORT, () => {
      console.log(`BE1 (Environmental + Social) listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start BE1 server:', error);
    process.exit(1);
  }
}

startServer();
