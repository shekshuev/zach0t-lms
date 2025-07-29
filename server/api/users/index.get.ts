import type { Pageable } from "~/types/shared";
import type { FilterUserDto, ReadUserDto } from "~/types/user";
import { USER_ROLES, USER_STATUSES } from "~/types/user";

export default defineEventHandler(async event => {
  await requireAdminSession(event);

  const query = getQuery<FilterUserDto>(event);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {};

  if (query.role && USER_ROLES.includes(query.role)) {
    filters.role = query.role;
  }

  if (query.status && USER_STATUSES.includes(query.status)) {
    filters.status = query.status;
  }

  if (query.username && typeof query.username === "string") {
    filters.username = { $regex: query.username, $options: "i" };
  }

  if (query.firstName && typeof query.firstName === "string") {
    filters.firstName = { $regex: query.firstName, $options: "i" };
  }

  if (query.lastName && typeof query.lastName === "string") {
    filters.lastName = { $regex: query.lastName, $options: "i" };
  }

  if (query.group && typeof query.group === "string") {
    filters.group = { $regex: query.group, $options: "i" };
  }

  const page = Math.max(query.page || 1, 1);
  const limit = Math.min(query.limit || 20, 100);
  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    User.countDocuments(filters),
    User.find(filters).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return {
    items: users.map(toReadUserDto),
    total,
    page,
    limit,
  } as Pageable<ReadUserDto>;
});
