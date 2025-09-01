import type { HydratedDocument, InferSchemaType } from "mongoose";
import { Schema, model } from "mongoose";

const QuizResultSchema = new Schema({
  quizId: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      questionId: String,
      options: [String],
      score: {
        type: Number,
        default: 0,
      },
    },
  ],
  nextQuestionIndex: {
    type: Number,
    default: 0,
  },
  cheatAttempts: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: QUIZ_STATUSES,
    default: "pending",
    required: true,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  deadlineAt: {
    type: Date,
  },
  bannedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
});

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
  quizResults: {
    type: [QuizResultSchema],
    default: [],
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

export type QuizResultType = InferSchemaType<typeof QuizResultSchema>;
export type ClassDocument = HydratedDocument<InferSchemaType<typeof ClassSchema>>;

export const Class = model("Class", ClassSchema);
