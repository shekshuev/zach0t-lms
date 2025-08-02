import type { H3Event } from "h3";
import type { SessionPayload } from "~/types/user";
import { USER_ROLES } from "~/types/user";

export async function requireAdminSession(event: H3Event) {
  const { user } = await requireUserSession(event);
  if ((user as SessionPayload)?.role !== "admin") {
    throw createError({ statusCode: 403, message: "forbidden" });
  }
  return user as SessionPayload;
}

export async function requireTeacherSession(event: H3Event) {
  const { user } = await requireUserSession(event);
  if (!["admin", "teacher"].includes((user as SessionPayload)?.role)) {
    throw createError({ statusCode: 403, message: "forbidden" });
  }
  return user as SessionPayload;
}

export async function requireStudentSession(event: H3Event) {
  const { user } = await requireUserSession(event);
  if (!USER_ROLES.includes((user as SessionPayload)?.role)) {
    throw createError({ statusCode: 403, message: "forbidden" });
  }
  return user as SessionPayload;
}
