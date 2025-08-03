import { z } from "zod";

export interface FilterSubjectDto {
  title?: string;
  shortTitle?: string;
  page: number;
  limit: number;
}

export interface CreateSubjectDto {
  title: string;
  shortTitle: string;
  description?: string | null;
}

export type UpdateSubjectDto = Partial<CreateSubjectDto>;

export interface ReadSubjectDto extends CreateSubjectDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const subjectSchema = z.object({
  title: z.string().min(SUBJECT_TITLE_MIN_LENGTH).max(SUBJECT_TITLE_MAX_LENGTH),
  shortTitle: z.string().min(SUBJECT_SHORT_TITLE_MIN_LENGTH).max(SUBJECT_SHORT_TITLE_MAX_LENGTH),
  description: z.union([
    z.literal(""),
    z.string().min(SUBJECT_DESCRIPTION_MIN_LENGTH).max(SUBJECT_DESCRIPTION_MAX_LENGTH).nullable().optional(),
  ]),
});
