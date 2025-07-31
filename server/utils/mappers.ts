import type { UserDocument } from "~/server/models/user.schema";
import type { ReadClassDto } from "~/types/class";
import type { ReadFullLessonDto, ReadLessonDto } from "~/types/lesson";
import type { ReadSubjectDto } from "~/types/subject";
import type { ReadUserDto, UserRole } from "~/types/user";
import type { ClassDocument } from "../models/class.schema";
import type { LessonDocument } from "../models/lesson.shema";
import type { SubjectDocument } from "../models/subject.schema";

export function toReadUserDto(user: UserDocument): ReadUserDto {
  return {
    id: user._id.toString(),
    username: user.username,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    role: user.role as UserRole,
    status: user.status,
    group: user.group || null,
    resetPasswordToken: user.resetPasswordToken,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toReadSubjectDto(subject: SubjectDocument): ReadSubjectDto {
  return {
    id: subject._id.toString(),
    title: subject.title,
    shortTitle: subject.shortTitle,
    description: subject.description,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

export function toReadLessonDto(lesson: LessonDocument): ReadLessonDto {
  return {
    id: lesson._id.toString(),
    topic: lesson.topic,
    hours: lesson.hours,
    subjectId: lesson.subjectId.toString(),
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

export function toReadFullLessonDto(lesson: LessonDocument): ReadFullLessonDto {
  return {
    ...toReadLessonDto(lesson),
    content: lesson.content,
  };
}

export function toReadClassDto(cls: ClassDocument): ReadClassDto {
  return {
    id: cls._id.toString(),
    beginAt: cls.beginAt,
    group: cls.group,
    lesson: toReadFullLessonDto(cls.lesson as LessonDocument),
    shortTitle: cls.shortTitle,
    title: cls.title,
    status: cls.status,
    createdAt: cls.createdAt,
    updatedAt: cls.updatedAt,
  };
}
