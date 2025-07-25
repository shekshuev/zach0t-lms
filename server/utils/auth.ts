import type { H3Event } from "h3";
import type { SessionPayload } from "~/types/user";

export async function requireAdminSession(event: H3Event) {
  const { user } = await requireUserSession(event);
  if ((user as SessionPayload)?.role !== "admin") {
    throw createError({ statusCode: 403, message: "forbidden" });
  }
  return user;
}
