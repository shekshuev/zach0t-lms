import type { UserDocument } from "~/server/models/user.schema";
import type { ReadUserDto, UserRole } from "~/types/user";

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
