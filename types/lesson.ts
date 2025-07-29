import { z } from "zod";
import { LESSON_SUBJECT_ID_REGEX, LESSON_TOPIC_MAX_LENGTH, LESSON_TOPIC_MIN_LENGTH } from "~/utils/validation";

export interface FilterLessonDto {
  topic?: string;
  subjectId?: string;
  page: number;
  limit: number;
}

export interface CreateLessonDto {
  topic: string;
  hours: number;
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

export const schema = z.object({
  topic: z.string().min(LESSON_TOPIC_MIN_LENGTH).max(LESSON_TOPIC_MAX_LENGTH),
  hours: z.number().positive(),
  subjectId: z.string().regex(LESSON_SUBJECT_ID_REGEX),
  content: z.object({}).passthrough().optional().nullable(),
});
