export default defineEventHandler(async event => {
  await requireAdminSession(event);
  const body = await readBody<CreateSubjectDto>(event);

  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { title, shortTitle, description } = parsed.data;

  const existing = await Subject.findOne({ shortTitle });
  if (existing) {
    throw createError({ statusCode: 409, message: "subject_already_exists" });
  }

  const subject = await Subject.create({
    title,
    shortTitle,
    description,
  });

  return toReadSubjectDto(subject);
});
