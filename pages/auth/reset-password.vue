<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import type { ResetPasswordDto } from "~/types/user";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "~/utils/validation";

definePageMeta({ layout: "auth" });

const { fetch: refreshSession } = useUserSession();

const toast = useToast();

const { t } = useI18n();

const schema = z
  .object({
    username: z
      .string({ message: t("validations.username.required") })
      .min(USERNAME_MIN_LENGTH, t("validations.username.min", { length: USERNAME_MIN_LENGTH }))
      .max(USERNAME_MAX_LENGTH, t("validations.username.max", { length: USERNAME_MAX_LENGTH }))
      .regex(USERNAME_REGEX, t("validations.username.pattern")),

    password: z
      .string({ message: t("validations.password.required") })
      .min(PASSWORD_MIN_LENGTH, t("validations.password.min", { length: PASSWORD_MIN_LENGTH }))
      .max(PASSWORD_MAX_LENGTH, t("validations.password.max", { length: PASSWORD_MAX_LENGTH }))
      .regex(PASSWORD_REGEX, t("validations.password.pattern")),

    passwordConfirm: z.string({ message: t("validations.password.confirm") }),

    token: z
      .string({ message: t("validations.reset-password-token.required") })
      .uuid({ message: t("validations.reset-password-token.pattern") }),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: t("validations.password.confirm"),
    path: ["passwordConfirm"],
  });

const state = reactive({
  username: "",
  password: "",
  passwordConfirm: "",
  token: "",
});

function onSubmit(e: FormSubmitEvent<ResetPasswordDto>) {
  $fetch("/api/auth/reset-password", {
    method: "POST",
    body: e.data,
  })
    .then(() => {
      refreshSession();
    })
    .catch(err => {
      const msg = err?.data?.message || "unknown_error";
      toast.add({ title: t(`errors.${msg}`), color: "error" });
    });
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UCard class="max-w-sm w-sm space-y-4">
      <template #header>
        <h2 class="text-2xl font-bold text-center">{{ $t("pages.auth.reset-password") }}</h2>
      </template>
      <div class="grid gap-4">
        <UFormField :label="$t('pages.auth.username')" name="username">
          <UInput v-model.trim="state.username" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.auth.password')" name="password">
          <UInput v-model.trim="state.password" type="password" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.auth.password-confirm')" name="passwordConfirm">
          <UInput v-model.trim="state.passwordConfirm" type="password" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.auth.reset-token')" name="token">
          <UInput v-model.trim="state.token" class="w-full" />
        </UFormField>
      </div>
      <template #footer>
        <div class="flex flex-col gap-2 items-center">
          <UButton type="submit" block> {{ $t("pages.auth.submit") }} </UButton>
          <UButton variant="link" to="/auth/sign-in" color="neutral"> {{ $t("pages.auth.sign-in") }} </UButton>
        </div>
      </template>
    </UCard>
  </UForm>
</template>
