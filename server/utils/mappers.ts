import type { UserDocument } from "~/server/models/user.schema";
import type { ReadSubjectDto } from "~/types/subject";
import type { ReadUserDto, UserRole } from "~/types/user";
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
    description: subject.description,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}
