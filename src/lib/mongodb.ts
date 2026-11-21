import mongoose from "mongoose";
import dns from "node:dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.local.example)."
    );
  }

  // If already connected and active, return it
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    cache.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cache.conn = m;
        return m;
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err);
        cache.conn = null;
        cache.promise = null;
        throw err;
      });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.conn = null;
    cache.promise = null;
    throw err;
  }
}
