export default defineEventHandler(async event => {
  await requireAdminSession(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 404, message: "user_not_found" });
  }

  const user = await User.findById(id).select("-passwordHash");
  if (!user) {
    throw createError({ statusCode: 404, message: "user_not_found" });
  }

  return toReadUserDto(user);
});
