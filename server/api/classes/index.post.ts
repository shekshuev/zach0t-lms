export default defineEventHandler(async event => {
  await requireTeacherSession(event);
  const body = await readBody<CreateClassDto>(event);

  const parsed = classSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { beginAt, group, lessonId, shortTitle, status, title } = parsed.data;

  if (!lessonId) {
    throw createError({ statusCode: 404, message: "lesson_not_found" });
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw createError({ statusCode: 404, message: "lesson_not_found" });
  }

  const cls = await Class.create({
    beginAt,
    group,
    lesson,
    shortTitle,
    status,
    title,
  });

  return toReadFullClassDto(cls);
});
