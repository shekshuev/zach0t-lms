export interface FilterSubjectDto {
  title?: string;
  page: number;
  limit: number;
}

export interface CreateSubjectDto {
  title: string;
  description?: string | null;
}

export type UpdateSubjectDto = Partial<CreateSubjectDto>;

export interface ReadSubjectDto extends CreateSubjectDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
