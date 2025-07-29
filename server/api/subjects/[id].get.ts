export default defineEventHandler(async event => {
  await requireStudentSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 404, message: "subject_not_found" });
  }

  const subject = await Subject.findById(id);
  if (!subject) {
    throw createError({ statusCode: 404, message: "subject_not_found" });
  }

  return toReadSubjectDto(subject);
});
