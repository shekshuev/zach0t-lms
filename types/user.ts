import { z } from "zod";

import {
  FIRST_NAME_MAX_LENGTH,
  FIRST_NAME_MIN_LENGTH,
  FIRST_NAME_REGEX,
  GROUP_MAX_LENGTH,
  LAST_NAME_MAX_LENGTH,
  LAST_NAME_MIN_LENGTH,
  LAST_NAME_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "~/utils/validation";

export interface LoginDto {
  username: string;
  password: string;
}

export interface ResetPasswordDto {
  username: string;
  password: string;
  passwordConfirm: string;
  token: string;
}

export const USER_ROLES = ["admin", "teacher", "student"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "blocked", "created"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface SessionPayload {
  id: string;
  username: string;
  role: UserRole;
}

export interface CreateUserDto {
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  password?: string | null;
  passwordConfirm?: string | null;
  group?: string | null;
  role: UserRole;
  status: UserStatus;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface ReadUserDto extends Omit<CreateUserDto, "password" | "passwordConfirm"> {
  id: string;
  resetPasswordToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterUserDto {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
  username?: string;
  firstName?: string;
  lastName?: string;
  group?: string;
}

export const schema = z
  .object({
    username: z.string().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH).regex(USERNAME_REGEX),
    password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).regex(PASSWORD_REGEX).optional().nullable(),
    passwordConfirm: z.string().optional().nullable(),
    firstName: z.union([
      z.literal(""),
      z.string().min(FIRST_NAME_MIN_LENGTH).max(FIRST_NAME_MAX_LENGTH).regex(FIRST_NAME_REGEX).nullable().optional(),
    ]),
    lastName: z.union([
      z.literal(""),
      z.string().min(LAST_NAME_MIN_LENGTH).max(LAST_NAME_MAX_LENGTH).regex(LAST_NAME_REGEX).nullable().optional(),
    ]),
    group: z.union([z.literal(""), z.string().max(GROUP_MAX_LENGTH).nullable().optional()]),
    role: z.enum(USER_ROLES),
    status: z.enum(USER_STATUSES),
  })
  .refine(data => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
  });
