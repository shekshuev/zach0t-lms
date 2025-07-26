<script setup lang="ts">
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
  FIRST_NAME_MIN_LENGTH,
  FIRST_NAME_MAX_LENGTH,
  FIRST_NAME_REGEX,
  LAST_NAME_MIN_LENGTH,
  LAST_NAME_MAX_LENGTH,
  LAST_NAME_REGEX,
} from "~/utils/validation";
import type { ReadUserDto, UserRole } from "~/types/user";
import { USER_ROLES, USER_STATUSES } from "~/types/user";
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({ layout: "dashboard" });

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isNew = computed(() => route.params.id === "new");
const id = computed(() => route.params.id as string);

const schema = z.object({
  username: z
    .string({ message: t("validations.username.required") })
    .min(USERNAME_MIN_LENGTH, t("validations.username.min", { length: USERNAME_MIN_LENGTH }))
    .max(USERNAME_MAX_LENGTH, t("validations.username.max", { length: USERNAME_MAX_LENGTH }))
    .regex(USERNAME_REGEX, t("validations.username.pattern")),
  firstName: z.union([
    z.literal(""),
    z
      .string()
      .min(FIRST_NAME_MIN_LENGTH, t("validations.first-name.min", { length: FIRST_NAME_MIN_LENGTH }))
      .max(FIRST_NAME_MAX_LENGTH, t("validations.first-name.max", { length: FIRST_NAME_MAX_LENGTH }))
      .regex(FIRST_NAME_REGEX, t("validations.first-name.pattern"))
      .nullable()
      .optional(),
  ]),
  lastName: z.union([
    z.literal(""),
    z
      .string()
      .min(LAST_NAME_MIN_LENGTH, t("validations.last-name.min", { length: LAST_NAME_MIN_LENGTH }))
      .max(LAST_NAME_MAX_LENGTH, t("validations.last-name.max", { length: LAST_NAME_MAX_LENGTH }))
      .regex(LAST_NAME_REGEX, t("validations.last-name.pattern"))
      .nullable()
      .optional(),
  ]),
  role: z.enum(USER_ROLES, { message: t("validations.user-role.includes", { values: USER_ROLES.join(", ") }) }),
  status: z.enum(USER_STATUSES, {
    message: t("validations.user-status.includes", { values: USER_STATUSES.join(", ") }),
  }),
});

const state = reactive<z.infer<typeof schema>>({
  username: "",
  firstName: "",
  lastName: "",
  role: "user" as UserRole,
  status: "created",
});

const { data, refresh } = await useAsyncData(
  `admin-user-${id.value}`,
  () => $fetch<ReadUserDto>(`/api/users/${id.value}`),
  {
    immediate: false,
  },
);

watchEffect(() => {
  if (!isNew.value) {
    refresh();
  }
});

watch(data, newValue => {
  if (newValue) {
    Object.assign(state, newValue);
  }
});

async function onSubmit(e: FormSubmitEvent<typeof state>) {
  try {
    if (isNew.value) {
      await $fetch("/api/admin/users", {
        method: "POST",
        body: e.data,
      });
    } else {
      await $fetch(`/api/admin/users/${id.value}`, {
        method: "PUT",
        body: e.data,
      });
    }
    toast.add({ title: "Saved successfully" });
    router.push("/admin/users");
  } catch (err) {
    toast.add({
      title: "Error",
      description: err?.data?.message || "Unexpected error",
    });
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UCard class="max-w-xl w-full space-y-4 mx-auto mt-8">
      <template #header>
        <h2 class="text-2xl font-bold text-center">
          {{ isNew ? "Create User" : "Edit User" }}
        </h2>
      </template>

      <div class="grid gap-4">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" class="w-full" />
        </UFormField>

        <UFormField label="First Name" name="firstName">
          <UInput v-model="state.firstName" class="w-full" />
        </UFormField>

        <UFormField label="Last Name" name="lastName">
          <UInput v-model="state.lastName" class="w-full" />
        </UFormField>

        <UFormField label="Role" name="role">
          <USelect v-model="state.role" :items="USER_ROLES as unknown as string[]" class="w-full" />
        </UFormField>

        <UFormField label="Status" name="status">
          <USelect v-model="state.status" :items="USER_STATUSES as unknown as string[]" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <UButton type="submit" block>
          {{ isNew ? "Create" : "Save Changes" }}
        </UButton>
      </template>
    </UCard>
  </UForm>
</template>
