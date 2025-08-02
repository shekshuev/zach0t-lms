import type { UpdateClassDto } from "~/types/class";
import { schema } from "~/types/class";

export default defineEventHandler(async event => {
  await requireTeacherSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody<UpdateClassDto>(event);

  const parsed = schema.safeParse(body);
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

  const updated = await Class.findByIdAndUpdate(
    id,
    {
      beginAt,
      group,
      lesson,
      shortTitle,
      status,
      title,
      updatedAt: new Date(),
    },
    { new: true },
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  return toReadFullClassDto(updated);
});
