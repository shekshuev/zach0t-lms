import type { UpdateSubjectDto } from "~/types/subject";
import { schema } from "~/types/subject";

export default defineEventHandler(async event => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody<UpdateSubjectDto>(event);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { title, shortTitle, description } = parsed.data;

  const updated = await Subject.findByIdAndUpdate(
    id,
    {
      title,
      shortTitle,
      description,
      updatedAt: new Date(),
    },
    { new: true },
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "subject_not_found" });
  }

  return toReadSubjectDto(updated);
});
