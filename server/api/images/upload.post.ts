import { createError, defineEventHandler, readMultipartFormData } from "h3";
import mongoose from "mongoose";
import { Readable } from "node:stream";

export default defineEventHandler(async event => {
  await requireTeacherSession(event);

  const parts = await readMultipartFormData(event);
  if (!parts || !parts.length) {
    throw createError({ statusCode: 400, statusMessage: "No file" });
  }

  const filePart = parts.find(p => p.type && p.data);
  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: "No file field" });
  }

  const bucket = getGridFSBucket("uploads");
  const filename = filePart.filename || "image";
  const contentType = filePart.type || "application/octet-stream";

  const uploadStream = bucket.openUploadStream(filename, {
    contentType,
    metadata: { from: "zach0t-lms", fieldName: filePart.name || "file" },
  });

  await new Promise<void>((resolve, reject) => {
    Readable.from(filePart.data)
      .pipe(uploadStream)
      .on("finish", () => resolve())
      .on("error", reject);
  });

  const id = uploadStream.id as mongoose.Types.ObjectId;

  return { url: `/api/images/${id.toString()}` };
});
