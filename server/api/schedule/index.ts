import type { FilterScheduleDto } from "~/types/class";

export default defineEventHandler(async event => {
  const user = await requireStudentSession(event);

  const query = getQuery<FilterScheduleDto>(event);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {};

  filters.group = { $regex: user.group, $options: "i" };

  if (query.from && typeof query.from === "string") {
    const date = new Date(query.from);
    filters.beginAt = { $gte: date };
  }

  if (query.to && typeof query.to === "string") {
    const date = new Date(query.to);
    filters.beginAt = { $lte: date };
  }

  const classes = await Class.find(filters).sort({ beginAt: 1 });

  return classes.map(toReadClassDto);
});
