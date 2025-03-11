import mongoose , { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGO_DB_URL;

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL!!');
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}


let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!cached) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      dbName: 'dev-overflow'
    };

    cached.promise = mongoose.connect(MONGODB_URL!, opts).then((mongoose: Mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;


