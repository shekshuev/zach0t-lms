import type { HydratedDocument, InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";

const SubjectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  shortTitle: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
});

export type SubjectDocument = HydratedDocument<InferSchemaType<typeof SubjectSchema>>;

export const Subject = model("Subject", SubjectSchema);
