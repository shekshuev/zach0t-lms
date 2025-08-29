export default defineEventHandler(async event => {
  await requireTeacherSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }
  const cls = await Class.findByIdAndDelete(id);
  if (!cls) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  setResponseStatus(event, 204);
});
