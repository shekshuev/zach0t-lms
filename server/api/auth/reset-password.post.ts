import { uuid } from "uuidv4";
import { z } from "zod";
import type { ResetPasswordDto, SessionPayload, UserRole } from "~/types/user";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "~/utils/validation";

const schema = z.object({
  username: z.string().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH).regex(USERNAME_REGEX),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).regex(PASSWORD_REGEX),
  passwordConfirm: z.string().nullable().optional(),
  token: z.string().uuid(),
});

export default defineEventHandler(async event => {
  const body = await readBody<ResetPasswordDto>(event);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { username, password, token } = parsed.data;

  const user = await User.findOne({ username, resetPasswordToken: token });

  if (!user || (user && user.status !== "created")) {
    throw createError({
      statusCode: 404,
      message: "user_not_found",
    });
  }

  await User.findByIdAndUpdate(user.id, {
    passwordHash: await hashPassword(password),
    status: "active",
    resetPasswordToken: uuid(),
    updatedAt: new Date(),
  });

  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
  };
  await setUserSession(
    event,
    {
      user: payload,
    },
    {
      maxAge: 60 * 60 * 24 * 7,
    },
  );
  return {};
});
