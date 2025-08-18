import { parseDateTime } from "@internationalized/date";

export default defineEventHandler(async event => {
  const user = await requireStudentSession(event);

  const query = getQuery<FilterScheduleDto>(event);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {};

  if (!user.group || typeof user.group !== "string") {
    return [];
  }

  filters.group = { $regex: user.group, $options: "i" };

  if (query.from && typeof query.from === "string") {
    const date = parseDateTime(query.from).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate("UTC");
    filters.beginAt = { $gte: date };
  }

  if (query.to && typeof query.to === "string") {
    const date = parseDateTime(query.to).set({ hour: 23, minute: 59, second: 59, millisecond: 59 }).toDate("UTC");
    filters.beginAt = { ...(filters.beginAt || {}), $lte: date };
  }

  const classes = await Class.find(filters).sort({ beginAt: 1 });

  return classes.map(toReadClassDto);
});
