import { MongoClient, ObjectId } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config()

const client = new MongoClient(process.env.MONGO_URI)
let db

export async function connectDB() {
  await client.connect()
  db = client.db('nature-noticed')
  console.log('MongoDB connected')
}

export function getDB() {
  if (!db) throw new Error('Database not connected')
  return db
}

// Re-export ObjectId so routes can use it
export { ObjectId }