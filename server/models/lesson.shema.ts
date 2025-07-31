import type { HydratedDocument, InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";

export const LessonSchema = new Schema({
  topic: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
    default: 2,
  },
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  content: {
    type: Object,
    required: true,
    default: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "" }],
        },
      ],
    },
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

export type LessonDocument = HydratedDocument<InferSchemaType<typeof LessonSchema>>;

export const Lesson = model("Lesson", LessonSchema);
