export default defineEventHandler(async event => {
  await requireAdminSession(event);
  const id = getRouterParam(event, "id");
  const body = await readBody<UpdateUserDto>(event);

  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { username, password, firstName, lastName, group, role, status } = parsed.data;

  const passwordHash = status === "created" || !password ? null : await hashPassword(password);

  const updated = await User.findByIdAndUpdate(
    id,
    {
      username,
      passwordHash,
      firstName,
      lastName,
      role,
      group,
      status,
      updatedAt: new Date(),
    },
    { new: true },
  );

  if (!updated) {
    throw createError({ statusCode: 404, message: "user_not_found" });
  }

  return toReadUserDto(updated);
});
