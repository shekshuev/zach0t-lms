import type { FilterLessonDto, ReadLessonDto } from "~/types/lesson";
import type { Pageable } from "~/types/shared";

export default defineEventHandler(async event => {
  await requireTeacherSession(event);

  const query = getQuery<FilterLessonDto>(event);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {};

  if (query.topic && typeof query.topic === "string") {
    filters.topic = { $regex: query.topic, $options: "i" };
  }

  if (query.subjectId && typeof query.subjectId === "string") {
    filters.subjectId = query.subjectId;
  }

  const page = Math.max(query.page || 1, 1);
  const limit = Math.min(query.limit || 20, 100);
  const skip = (page - 1) * limit;

  const [total, lessons] = await Promise.all([
    Lesson.countDocuments(filters),
    Lesson.find(filters).select("-content").sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return {
    items: lessons.map(toReadLessonDto),
    total,
    page,
    limit,
  } as Pageable<ReadLessonDto>;
});
