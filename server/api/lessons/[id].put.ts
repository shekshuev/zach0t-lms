import type { UpdateLessonDto } from "~/types/lesson";
import { schema } from "~/types/lesson";

export default defineEventHandler(async event => {
  await requireTeacherSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody<UpdateLessonDto>(event);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { topic, hours, subjectId } = parsed.data;

  const updated = await Lesson.findByIdAndUpdate(
    id,
    {
      topic,
      hours,
      subjectId,
      updatedAt: new Date(),
    },
    { new: true },
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "lesson_not_found" });
  }

  return toReadFullLessonDto(updated);
});
