<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({ layout: "auth" });

const { fetch: refreshSession } = useUserSession();

const toast = useToast();

const { t } = useI18n();

const schema = z.object({
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
});

const state = reactive({
  username: "",
  password: "",
});

function onSubmit(e: FormSubmitEvent<LoginDto>) {
  $fetch("/api/auth/sign-in", {
    method: "POST",
    body: e.data,
  })
    .then(() => {
      refreshSession();
    })
    .catch(err => {
      const msg = err?.data?.message || "unknown";
      toast.add({ title: t(`errors.${msg}`), color: "error" });
    });
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UCard class="max-w-sm w-sm space-y-4">
      <template #header>
        <h2 class="text-2xl font-bold text-center">{{ $t("pages.auth.sign-in") }}</h2>
      </template>
      <div class="grid gap-4">
        <UFormField :label="$t('pages.auth.username')" name="username">
          <UInput v-model.trim="state.username" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.auth.password')" name="password">
          <UInput v-model.trim="state.password" type="password" class="w-full" />
        </UFormField>
      </div>
      <template #footer>
        <div class="flex flex-col gap-2 items-center">
          <UButton type="submit" block> {{ $t("pages.auth.submit") }} </UButton>
          <UButton variant="link" color="neutral" to="/auth/reset-password">
            {{ $t("pages.auth.forgot-password") }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UForm>
</template>
