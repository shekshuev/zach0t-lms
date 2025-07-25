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

export interface ReadUserDto {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
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
