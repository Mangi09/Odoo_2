const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecosphere';
let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  console.log(`Connected to MongoDB database: ${db.databaseName}`);
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
}

function getClient() {
  if (!client) throw new Error('MongoClient not initialized. Call connectDB() first.');
  return client;
}

const { ObjectId } = require('mongodb');
function toDbId(id) {
  if (!id) return null;
  if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
    return new ObjectId(id);
  }
  return id;
}

async function runInTransaction(callback) {
  if (!client) throw new Error('MongoClient not initialized.');
  const session = client.startSession();
  try {
    let result;
    try {
      await session.withTransaction(async () => {
        result = await callback(session);
      });
    } catch (err) {
      if (err.message && (
        err.message.includes('Transaction numbers') || 
        err.message.includes('session') || 
        err.message.includes('ReplicaSet') || 
        err.message.includes('replica set')
      )) {
        console.warn('Fallback to non-transactional mode due to MongoDB configuration:', err.message);
        result = await callback(null);
      } else {
        throw err;
      }
    }
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  connectDB,
  getDB,
  getClient,
  toDbId,
  runInTransaction
};
