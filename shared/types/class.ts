import z from "zod";
import type { ReadFullLessonDto } from "./lesson";

export const CLASS_STATUSES = ["opened", "closed"] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

export const QUIZ_STATUSES = ["pending", "started", "finished", "banned"] as const;
export type QuizStatus = (typeof QUIZ_STATUSES)[number];

export interface UnbanQuizResultDto {
  userId: string;
}

export interface CreateQuizResultAnswerDto {
  questionId: string;
  options: string[];
}

export interface CreateQuizResultDto {
  quizId: string;
  userId: string;
  answers: CreateQuizResultAnswerDto[];
}

export interface ReadQuizResultAnswerDto extends CreateQuizResultAnswerDto {
  score: number;
}

export interface ReadQuizResultDto extends CreateQuizResultDto {
  answers: ReadQuizResultAnswerDto[];
  startedAt: string;
  completedAt: string | null;
  deadlineAt: string | null;
  status: QuizStatus;
  nextQuestionIndex: number;
  cheatAttempts: number;
}

export interface ReadStudentQuizResultDto {
  quizId: string;
  nextQuestionIndex: number;
  status: QuizStatus;
  startedAt: string;
  completedAt: string | null;
}

export interface FilterClassDto {
  lessonId?: string;
  group?: string;
  status?: ClassStatus;
  beginAt?: Date;
  title?: string;
  shortTitle?: string;
  page: number;
  limit: number;
}

export interface FilterScheduleDto {
  from?: string;
  to?: string;
}

export interface CreateClassDto {
  lessonId: string;
  beginAt: Date;
  group: string;
  title: string;
  shortTitle: string;
  status: ClassStatus;
}

export type UpdateClassDto = Partial<CreateClassDto>;

export interface ReadClassDto extends Omit<CreateClassDto, "lessonId" | "beginAt"> {
  id: string;
  beginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadFullClassDto extends ReadClassDto {
  lesson: ReadFullLessonDto;
  quizResults: ReadQuizResultDto[];
}

export interface ReadStudentFullClassDto extends ReadClassDto {
  lesson: ReadFullLessonDto;
  quizResults: ReadStudentQuizResultDto[];
}

export const classSchema = z.object({
  lessonId: z.string().regex(CLASS_LESSON_ID_REGEX),
  beginAt: z.coerce.date(),
  group: z.string().min(GROUP_MIN_LENGTH).max(GROUP_MAX_LENGTH),
  title: z.string().min(CLASS_TITLE_MIN_LENGTH).max(CLASS_TITLE_MAX_LENGTH),
  shortTitle: z.string().min(CLASS_SHORT_TITLE_MIN_LENGTH).max(CLASS_SHORT_TITLE_MAX_LENGTH),
  status: z.enum(CLASS_STATUSES),
});

export const answerQuizSchema = z.object({
  questionId: z.string().uuid(),
  options: z.array(z.string()).min(1),
});

export const unbanQuizResultSchema = z.object({
  userId: z.string(),
});
