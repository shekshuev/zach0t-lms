import type { HydratedDocument, InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";

export const QuizOptionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
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
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

export const QuizQuestionSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: QUIZ_QUESTION_TYPES,
    default: "multiple",
  },
  prompt: {
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
  options: {
    type: [QuizOptionSchema],
    default: [],
    required: true,
  },
});

export const QuizSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: {
    type: [QuizQuestionSchema],
    default: [],
  },
});

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
  quizzes: {
    type: [QuizSchema],
    default: [],
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
