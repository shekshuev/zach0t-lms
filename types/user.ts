export interface LoginDto {
  username: string;
  password: string;
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
  role: UserRole;
  status: UserStatus;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface ReadUserDto extends Omit<CreateUserDto, "password" | "passwordConfirm"> {
  id: string;
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
}
