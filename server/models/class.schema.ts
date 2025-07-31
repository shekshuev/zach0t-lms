import type { HydratedDocument, InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";
import { LessonSchema } from "~/server/models/lesson.shema";
import { CLASS_STATUSES } from "~/types/class";

const ClassSchema = new Schema({
  group: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  shortTitle: {
    type: String,
    required: true,
  },
  beginAt: {
    type: Date,
    required: true,
  },
  lesson: {
    type: LessonSchema,
    required: true,
  },
  status: {
    type: String,
    enum: CLASS_STATUSES,
    default: "opened",
    required: true,
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

ClassSchema.pre("save", function (next) {
  if (this.isModified("beginAt") && typeof this.beginAt === "string") {
    this.beginAt = new Date(this.beginAt);
  }
  next();
});

export type ClassDocument = HydratedDocument<InferSchemaType<typeof ClassSchema>>;

export const Class = model("Class", ClassSchema);
