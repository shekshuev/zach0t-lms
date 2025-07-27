import bcrypt from "bcrypt";
import { z } from "zod";
import { User } from "~/server/models/user.schema";
import type { UpdateUserDto } from "~/types/user";
import { USER_ROLES, USER_STATUSES } from "~/types/user";
import {
  FIRST_NAME_MAX_LENGTH,
  FIRST_NAME_MIN_LENGTH,
  FIRST_NAME_REGEX,
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

export default defineEventHandler(async event => {
  const id = getRouterParam(event, "id");
  const body = await readBody<UpdateUserDto>(event);

  const schema = z
    .object({
      username: z.string().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH).regex(USERNAME_REGEX),
      password: z
        .string()
        .min(PASSWORD_MIN_LENGTH)
        .max(PASSWORD_MAX_LENGTH)
        .regex(PASSWORD_REGEX)
        .optional()
        .nullable(),
      passwordConfirm: z.string().optional().nullable(),
      firstName: z.union([
        z.literal(""),
        z.string().min(FIRST_NAME_MIN_LENGTH).max(FIRST_NAME_MAX_LENGTH).regex(FIRST_NAME_REGEX).nullable().optional(),
      ]),
      lastName: z.union([
        z.literal(""),
        z.string().min(LAST_NAME_MIN_LENGTH).max(LAST_NAME_MAX_LENGTH).regex(LAST_NAME_REGEX).nullable().optional(),
      ]),
      role: z.enum(USER_ROLES),
      status: z.enum(USER_STATUSES),
    })
    .refine(data => data.password === data.passwordConfirm, {
      path: ["passwordConfirm"],
    });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { username, password, firstName, lastName, role, status } = parsed.data;

  const passwordHash = status === "created" || !password ? null : await bcrypt.hash(password, 10);

  const updated = await User.findByIdAndUpdate(
    id,
    {
      username,
      passwordHash,
      firstName,
      lastName,
      role,
      status,
      updatedAt: new Date(),
    },
    { new: true },
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  return toReadUserDto(updated);
});
