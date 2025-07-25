<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { LoginDto } from "~/types/user";
import { z } from "zod";

definePageMeta({ layout: "auth" });

const { fetch: refreshSession } = useUserSession();

const { t } = useI18n();

const schema = z.object({
  username: z
    .string({ message: t("validations.username.required") })
    .min(USERNAME_MIN_LENGTH, t("validations.username.min"))
    .max(USERNAME_MAX_LENGTH, t("validations.username.max"))
    .regex(USERNAME_REGEX, t("validations.username.pattern")),

  password: z
    .string({ message: t("validations.password.required") })
    .min(PASSWORD_MIN_LENGTH, t("validations.password.min"))
    .max(PASSWORD_MAX_LENGTH, t("validations.password.max"))
    .regex(PASSWORD_REGEX, t("validations.password.pattern")),
});

const state = reactive({
  username: "",
  password: "",
});

function onSubmit(e: FormSubmitEvent<LoginDto>) {
  $fetch("/api/login", {
    method: "POST",
    body: e.data,
  })
    .then(() => {
      refreshSession();
    })
    .catch(err => {
      console.error(err);
    });
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UCard class="max-w-sm w-sm space-y-4">
      <template #header>
        <h2 class="text-2xl font-bold text-center">{{ $t("pages.auth.header") }}</h2>
      </template>

      <UFormField :label="$t('pages.auth.username')" name="userName">
        <UInput v-model="state.username" class="w-full" />
      </UFormField>

      <UFormField :label="$t('pages.auth.password')" name="password">
        <UInput v-model="state.password" type="password" class="w-full" />
      </UFormField>

      <template #footer>
        <UButton type="submit" block> {{ $t("pages.auth.submit") }} </UButton>
      </template>
    </UCard>
  </UForm>
</template>
