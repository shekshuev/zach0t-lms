export default defineEventHandler(async event => {
  await requireTeacherSession(event);
  const body = await readBody<CreateLessonDto>(event);

  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { topic, hours, subjectId } = parsed.data;

  const lesson = await Lesson.create({
    topic,
    hours,
    subjectId,
  });

  return toReadFullLessonDto(lesson);
});
