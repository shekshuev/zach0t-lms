export interface LoginDto {
  username: string;
  password: string;
}

export type UserRole = "admin" | "teacher" | "student";

export interface SessionPayload {
  id: string;
  username: string;
  role: UserRole;
}
