<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { SessionPayload } from "~/types/user";

const { user, clear } = useUserSession();
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(_isDark) {
    colorMode.preference = _isDark ? "dark" : "light";
  },
});

const { t } = useI18n();

const items = computed<NavigationMenuItem[][]>(() => {
  const result = [
    [
      {
        label: t("layouts.dashboard.menu.header"),
        type: "label",
      },
      {
        label: t("layouts.dashboard.menu.dashboard"),
        icon: "i-lucide-layout-dashboard",
        type: "link",
        to: "/",
      },
      {
        label: t("layouts.dashboard.menu.assignments"),
        icon: "i-lucide-list-todo",
        type: "link",
        to: "/assignments",
      },
      {
        label: t("layouts.dashboard.menu.schedule"),
        icon: "i-lucide-calendar-days",
        type: "link",
        to: "/schedule",
      },
      {
        label: t("layouts.dashboard.menu.teachers"),
        icon: "i-lucide-speech",
        type: "link",
        to: "/teachers",
      },
      {
        label: t("layouts.dashboard.menu.notes"),
        icon: "i-lucide-notebook-pen",
        type: "link",
        to: "/notes",
      },
      {
        label: t("layouts.dashboard.menu.files"),
        icon: "i-lucide-files",
        type: "link",
        to: "/files",
      },
      {
        label: t("layouts.dashboard.menu.settings"),
        icon: "i-lucide-settings",
        type: "link",
        to: "/settings",
      },
    ],
  ];
  if ((user?.value as SessionPayload)?.role === "admin") {
    result.push([
      {
        label: t("layouts.dashboard.menu.admin"),
        type: "label",
      },
      {
        label: t("layouts.dashboard.menu.users"),
        icon: "i-lucide-users",
        type: "link",
        to: "/admin/users",
      },
      {
        label: t("layouts.dashboard.menu.subjects"),
        icon: "i-lucide-book-open",
        type: "link",
        to: "/admin/subjects",
      },
    ]);
  }
  return result;
});

const collapsed = ref(true);

const bottomItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: isDark.value ? t("layouts.dashboard.menu.dark") : t("layouts.dashboard.menu.light"),
      icon: isDark.value ? "i-lucide-moon" : "i-lucide-sun",
      type: "trigger",
      onSelect: () => (isDark.value = !isDark.value),
    },
    {
      label: t("layouts.dashboard.menu.logout"),
      icon: "i-lucide-log-out",
      type: "trigger",
      onSelect: clear,
    },
  ],
  [
    {
      label: collapsed.value ? t("layouts.dashboard.menu.expand") : t("layouts.dashboard.menu.collapse"),
      icon: collapsed.value ? "i-lucide-chevron-right" : "i-lucide-chevron-left",
      type: "trigger",
      onSelect: () => (collapsed.value = !collapsed.value),
    },
  ],
]);

watchEffect(() => {
  if (!user.value) {
    navigateTo("/auth/sign-in");
  }
});
</script>

<template>
  <AuthState>
    <template #default>
      <div class="h-screen min-h-screen max-h-screen overflow-hidden w-full grid grid-cols-[auto_1fr] gap-2">
        <div class="flex flex-col justify-between max-h-screen">
          <UNavigationMenu
            tooltip
            :collapsed="collapsed"
            orientation="vertical"
            :items="items"
            :ui="{
              link: collapsed && 'px-3 py-3',
            }"
          />

          <UNavigationMenu
            tooltip
            :collapsed="collapsed"
            orientation="vertical"
            :items="bottomItems"
            :ui="{
              link: collapsed && 'px-3 py-3',
            }"
          />
        </div>
        <div class="max-h-screen overflow-y-auto">
          <slot />
        </div>
      </div>
    </template>
    <template #placeholder>
      <button disabled>Loading...</button>
    </template>
  </AuthState>
</template>
