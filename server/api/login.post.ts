import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "~/utils/validation";
import type { SessionPayload, UserRole } from "~/types/user";
import bcrypt from "bcrypt";
import { z } from "zod";

const bodySchema = z.object({
  username: z.string().min(USERNAME_MIN_LENGTH).max(USERNAME_MAX_LENGTH).regex(USERNAME_REGEX),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).regex(PASSWORD_REGEX),
});

export default defineEventHandler(async event => {
  const { username, password } = await readValidatedBody(event, bodySchema.parse);

  const user = await User.findOne({ username });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: "user_not_found",
    });
  }

  if (user.status === "blocked") {
    throw createError({
      statusCode: 403,
      message: "user_is_blocked",
    });
  }

  const matches = bcrypt.compareSync(password, user.passwordHash);

  if (!matches) {
    throw createError({
      statusCode: 403,
      message: "wrong_password",
    });
  }

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
