import z from "zod";
import type { ReadFullLessonDto } from "./lesson";

export const CLASS_STATUSES = ["opened", "closed"] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

export const QUIZ_STATUSES = ["pending", "started", "finished"] as const;
export type QuizStatus = (typeof QUIZ_STATUSES)[number];

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
  isCorrect: boolean;
}

export interface ReadQuizResultDto extends CreateQuizResultDto {
  answers: ReadQuizResultAnswerDto[];
  score: number;
  startedAt: string;
  completedAt: string | null;
  status: QuizStatus;
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

export const classSchema = z.object({
  lessonId: z.string().regex(CLASS_LESSON_ID_REGEX),
  beginAt: z.coerce.date(),
  group: z.string().min(GROUP_MIN_LENGTH).max(GROUP_MAX_LENGTH),
  title: z.string().min(CLASS_TITLE_MIN_LENGTH).max(CLASS_TITLE_MAX_LENGTH),
  shortTitle: z.string().min(CLASS_SHORT_TITLE_MIN_LENGTH).max(CLASS_SHORT_TITLE_MAX_LENGTH),
  status: z.enum(CLASS_STATUSES),
});
