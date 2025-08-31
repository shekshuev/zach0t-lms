import { z } from "zod";

export const QUIZ_QUESTION_TYPES = ["multiple", "open"] as const;
export type QuizQuestionType = (typeof QUIZ_QUESTION_TYPES)[number];

export interface QuizQuestionOption {
  id: string;
  text: object;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: object;
  options?: QuizQuestionOption[];
}

export interface Quiz {
  id: string;
  title: string;
  duration: number;
  maxCheatAttempts: number;
  questions: QuizQuestion[];
}

export interface FilterLessonDto {
  topic?: string;
  subjectId?: string;
  page: number;
  limit: number;
}

export interface CreateLessonDto {
  topic: string;
  hours: number;
  quizzes?: Quiz[];
  subjectId: string;
}

export interface UpdateLessonDto extends Partial<CreateLessonDto> {
  content?: object;
}

export interface ReadLessonDto extends CreateLessonDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadFullLessonDto extends ReadLessonDto {
  content: object;
}

export const quizAnswerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("multiple"),
    questionId: z.string().uuid(),
    value: z.array(z.string().uuid()),
  }),
  z.object({
    type: z.literal("open"),
    questionId: z.string().uuid(),
    value: z.string().min(LESSON_QUIZ_ANSWER_MIN_LENGTH).max(LESSON_QUIZ_ANSWER_MAX_LENGTH),
  }),
]);

export const quizResultSchema = z.object({
  answers: z.array(quizAnswerSchema),
});

export const quizOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.object({}).passthrough(),
  isCorrect: z.boolean().optional(),
});

export const quizQuestionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(QUIZ_QUESTION_TYPES),
  prompt: z.object({}).passthrough(),
  options: z.array(quizOptionSchema).optional().default([]),
});

export const quizSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(LESSON_QUIZ_TITLE_MIN_LENGTH).max(LESSON_QUIZ_TITLE_MAX_LENGTH),
  maxCheatAttempts: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
  questions: z.array(quizQuestionSchema),
});

export const lessonSchema = z.object({
  topic: z.string().min(LESSON_TOPIC_MIN_LENGTH).max(LESSON_TOPIC_MAX_LENGTH),
  hours: z.number().positive(),
  subjectId: z.string().regex(LESSON_SUBJECT_ID_REGEX),
  content: z.object({}).passthrough().optional().nullable(),
  quizzes: z.array(quizSchema).default([]),
});
