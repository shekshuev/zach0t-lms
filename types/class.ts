import z from "zod";
import {
  CLASS_LESSON_ID_REGEX,
  CLASS_SHORT_TITLE_MAX_LENGTH,
  CLASS_SHORT_TITLE_MIN_LENGTH,
  CLASS_TITLE_MAX_LENGTH,
  CLASS_TITLE_MIN_LENGTH,
  GROUP_MAX_LENGTH,
  GROUP_MIN_LENGTH,
} from "~/utils/validation";
import type { ReadFullLessonDto } from "./lesson";

export const CLASS_STATUSES = [
  "opened",
  "closed",
  "opened_after_start_forever",
  "opened_after_start_before_end",
] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

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

export interface CreateClassDto {
  lessonId: string;
  beginAt: Date;
  group: string;
  title: string;
  shortTitle: string;
  status: ClassStatus;
}

export type UpdateClassDto = Partial<CreateClassDto>;

export interface ReadClassDto extends Omit<CreateClassDto, "lessonId"> {
  id: string;
  lesson: ReadFullLessonDto;
  createdAt: Date;
  updatedAt: Date;
}

export const schema = z.object({
  lessonId: z.string().regex(CLASS_LESSON_ID_REGEX),
  beginAt: z.coerce.date(),
  group: z.string().min(GROUP_MIN_LENGTH).max(GROUP_MAX_LENGTH),
  title: z.string().min(CLASS_TITLE_MIN_LENGTH).max(CLASS_TITLE_MAX_LENGTH),
  shortTitle: z.string().min(CLASS_SHORT_TITLE_MIN_LENGTH).max(CLASS_SHORT_TITLE_MAX_LENGTH),
  status: z.enum(CLASS_STATUSES),
});
