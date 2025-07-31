import type { FilterClassDto, ReadClassDto } from "~/types/class";
import type { Pageable } from "~/types/shared";

export default defineEventHandler(async event => {
  await requireStudentSession(event);

  const query = getQuery<FilterClassDto>(event);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {};

  if (query.title && typeof query.title === "string") {
    filters.title = { $regex: query.title, $options: "i" };
  }

  if (query.shortTitle && typeof query.shortTitle === "string") {
    filters.shortTitle = { $regex: query.shortTitle, $options: "i" };
  }

  if (query.group && typeof query.group === "string") {
    filters.group = { $regex: query.group, $options: "i" };
  }

  if (query.lessonId && typeof query.lessonId === "string") {
    filters.lesson = { _id: query.lessonId };
  }

  if (query.status && typeof query.status === "string") {
    filters.status = query.status;
  }

  if (query.beginAt && Object.prototype.toString.call(query.beginAt) === "[object Date]") {
    filters.beginAt = { $gte: query.beginAt };
  }

  const page = Math.max(query.page || 1, 1);
  const limit = Math.min(query.limit || 20, 100);
  const skip = (page - 1) * limit;

  const [total, classes] = await Promise.all([
    Class.countDocuments(filters),
    Class.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return {
    items: classes.map(toReadClassDto),
    total,
    page,
    limit,
  } as Pageable<ReadClassDto>;
});
