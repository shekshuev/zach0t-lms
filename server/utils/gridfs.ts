import mongoose from "mongoose";

let bucket: mongoose.mongo.GridFSBucket | null = null;

export function getGridFSBucket(bucketName = "uploads") {
  const conn = mongoose.connection;
  if (!conn?.db) throw new Error("Mongo connection is not ready");
  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName });
  }
  return bucket;
}
