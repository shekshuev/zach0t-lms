export default defineEventHandler(async event => {
  await requireAdminSession(event);
  const body = await readBody<CreateUserDto>(event);

  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const { username, password, firstName, lastName, group, role, status } = parsed.data;

  const existing = await User.findOne({ username });
  if (existing) {
    throw createError({ statusCode: 409, message: "user_already_exists" });
  }

  const passwordHash = status === "created" || !password ? null : await hashPassword(password);

  const user = await User.create({
    username,
    passwordHash,
    firstName,
    lastName,
    group,
    role,
    status,
  });

  return toReadUserDto(user);
});
