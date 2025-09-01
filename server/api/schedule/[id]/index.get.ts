import { Types } from "mongoose";

export default defineEventHandler(async event => {
  await requireStudentSession(event);

  const user = await requireStudentSession(event);

  if (!user.group || typeof user.group !== "string") {
    return [];
  }

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {
    _id: new Types.ObjectId(id),
    group: undefined,
    status: "opened",
  };

  if (user.role === "student") {
    filters.group = { $regex: user.group, $options: "i" };
  }

  if (user.role === "teacher") {
    const groups = user.group.split(" ");
    filters.group = { $in: groups };
  }

  const cls = await Class.findOne(filters);
  if (!cls) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  return toReadFullStudentClassDto(cls, user.id);
});
