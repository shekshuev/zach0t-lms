import type { SessionPayload } from "~/types/user";

export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, user } = useUserSession();
  await useUserSession().fetch();
  if (!loggedIn.value || (user.value as SessionPayload)?.role !== "admin") {
    return navigateTo("/");
  }
});
