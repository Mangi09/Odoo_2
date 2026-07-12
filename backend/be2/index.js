const app = require('./app');
const { connectDB } = require('../shared/db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.BE2_PORT || 3002;

async function startServer() {
  try {
    // Establish database pool before opening network listener
    await connectDB();
    app.listen(PORT, () => {
      console.log(`BE2 (Governance + Gamification + Reports) listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start BE2 server:', error);
    process.exit(1);
  }
}

startServer();
