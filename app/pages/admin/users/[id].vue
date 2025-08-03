<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import { z } from "zod";

definePageMeta({ layout: "dashboard" });

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isNew = computed(() => route.params.id === "new");
const id = computed(() => route.params.id as string);

const statuses = computed(() => (isNew.value ? USER_STATUSES.filter(r => r != "blocked") : USER_STATUSES));

const schema = z
  .object({
    username: z
      .string({ message: t("validations.username.required") })
      .min(USERNAME_MIN_LENGTH, t("validations.username.min", { length: USERNAME_MIN_LENGTH }))
      .max(USERNAME_MAX_LENGTH, t("validations.username.max", { length: USERNAME_MAX_LENGTH }))
      .regex(USERNAME_REGEX, t("validations.username.pattern")),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, t("validations.password.min", { length: PASSWORD_MIN_LENGTH }))
      .max(PASSWORD_MAX_LENGTH, t("validations.password.max", { length: PASSWORD_MAX_LENGTH }))
      .regex(PASSWORD_REGEX, t("validations.password.pattern"))
      .nullable()
      .optional(),
    passwordConfirm: z.string().nullable().optional(),
    group: z.union([
      z.literal(""),
      z
        .string()
        .max(GROUP_MAX_LENGTH, t("validations.group.max", { length: GROUP_MAX_LENGTH }))
        .nullable()
        .optional(),
    ]),
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
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: t("validations.password.confirm"),
    path: ["passwordConfirm"],
  });

const state = reactive<CreateUserDto>({
  username: "",
  firstName: null,
  lastName: null,
  password: null,
  passwordConfirm: null,
  group: null,
  role: "student" as UserRole,
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

async function onSubmit(e: FormSubmitEvent<CreateUserDto | UpdateUserDto>) {
  try {
    if (isNew.value) {
      const result = await $fetch("/api/users", {
        method: "POST",
        body: e.data,
      });
      router.replace(`/admin/users/${result.id}`);
      toast.add({ title: t("pages.admin.users.user-created") });
    } else {
      await $fetch(`/api/users/${id.value}`, {
        method: "PUT",
        body: e.data,
      });
      toast.add({ title: t("pages.admin.users.user-updated") });
    }
  } catch (err) {
    const msg = (err as FetchError)?.data?.message || "unknown_error";
    toast.add({ title: t(`errors.${msg}`), color: "error" });
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="container mx-auto py-8" @submit="onSubmit">
    <UCard class="max-w-xl w-full space-y-4 mx-auto">
      <template #header>
        <h2 class="text-2xl font-bold text-center">
          {{ isNew ? $t("pages.admin.users.create-user") : $t("pages.admin.users.edit-user") }}
        </h2>
      </template>

      <div class="grid gap-4">
        <UFormField :label="$t('pages.admin.users.username')" name="username">
          <UInput v-model.trim="state.username" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.first-name')" name="firstName">
          <UInput v-model.trim.nullify="state.firstName" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.last-name')" name="lastName">
          <UInput v-model.trim.nullify="state.lastName" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.group')" name="group">
          <UInput v-model.trim.nullify="state.group" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.role')" name="role">
          <USelect v-model="state.role" :items="USER_ROLES as unknown as string[]" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.status')" name="status">
          <USelect v-model="state.status" :items="statuses as unknown as string[]" class="w-full" />
        </UFormField>

        <template v-if="state.status !== 'created' && isNew">
          <UFormField :label="$t('pages.admin.users.password')" name="password">
            <UInput v-model.trim.nullify="state.password" type="password" class="w-full" />
          </UFormField>

          <UFormField :label="$t('pages.admin.users.confirm-password')" name="passwordConfirm">
            <UInput v-model.trim.nullify="state.passwordConfirm" type="password" class="w-full" />
          </UFormField>
        </template>
      </div>

      <template #footer>
        <UButton type="submit" block>
          {{ $t("actions.save") }}
        </UButton>
      </template>
    </UCard>
  </UForm>
</template>
