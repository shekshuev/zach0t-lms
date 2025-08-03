import { Types } from "mongoose";

export default defineEventHandler(async event => {
  await requireStudentSession(event);

  const user = await requireStudentSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  const filters = {
    _id: new Types.ObjectId(id),
    group: user.group,
    status: "opened",
  };

  const cls = await Class.findOne(filters);
  if (!cls) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  return toReadFullClassDto(cls);
});
