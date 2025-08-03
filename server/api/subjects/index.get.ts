export default defineEventHandler(async event => {
  await requireStudentSession(event);

  const query = getQuery<FilterSubjectDto>(event);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {};

  if (query.title && typeof query.title === "string") {
    filters.title = { $regex: query.title, $options: "i" };
  }

  const page = Math.max(query.page || 1, 1);
  const limit = Math.min(query.limit || 20, 100);
  const skip = (page - 1) * limit;

  const [total, subjects] = await Promise.all([
    Subject.countDocuments(filters),
    Subject.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return {
    items: subjects.map(toReadSubjectDto),
    total,
    page,
    limit,
  } as Pageable<ReadSubjectDto>;
});
