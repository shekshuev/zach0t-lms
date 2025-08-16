import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export default defineEventHandler(async event => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 404, message: "image_not_found" });
  }

  let fileId: ObjectId;
  try {
    fileId = new ObjectId(id);
  } catch {
    throw createError({ statusCode: 404, message: "image_not_found" });
  }

  const bucket = getGridFSBucket("uploads");
  const db = mongoose.connection.db;
  if (!db) {
    throw createError({ statusCode: 500, message: "database_not_connected" });
  }
  const filesCol = db.collection(`${(bucket as any).s.options.bucketName}.files`);
  const file = await filesCol.findOne({ _id: fileId });
  if (!file) {
    throw createError({ statusCode: 404, message: "image_not_found" });
  }
  setHeader(event, "Content-Type", file.contentType || file.metadata?.contentType || "application/octet-stream");
  return bucket.openDownloadStream(fileId);
});
