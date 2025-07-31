export default defineEventHandler(async event => {
  await requireStudentSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  const lesson = await Class.findById(id);
  if (!lesson) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  return toReadClassDto(lesson);
});
