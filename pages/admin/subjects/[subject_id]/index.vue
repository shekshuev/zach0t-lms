<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import { z } from "zod";
import type { CreateSubjectDto, ReadSubjectDto, UpdateSubjectDto } from "~/types/subject";
import {
  SUBJECT_DESCRIPTION_MAX_LENGTH,
  SUBJECT_DESCRIPTION_MIN_LENGTH,
  SUBJECT_SHORT_TITLE_MAX_LENGTH,
  SUBJECT_SHORT_TITLE_MIN_LENGTH,
  SUBJECT_TITLE_MAX_LENGTH,
  SUBJECT_TITLE_MIN_LENGTH,
} from "~/utils/validation";

definePageMeta({ layout: "dashboard" });

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isNew = computed(() => route.params.subject_id === "new");
const id = computed(() => route.params.subject_id as string);

const schema = z.object({
  title: z
    .string({ message: t("validations.subject-title.required") })
    .min(SUBJECT_TITLE_MIN_LENGTH, t("validations.subject-title.min", { length: SUBJECT_TITLE_MIN_LENGTH }))
    .max(SUBJECT_TITLE_MAX_LENGTH, t("validations.subject-title.max", { length: SUBJECT_TITLE_MAX_LENGTH })),
  shortTitle: z
    .string({ message: t("validations.subject-short-title.required") })
    .min(
      SUBJECT_SHORT_TITLE_MIN_LENGTH,
      t("validations.subject-short-title.min", { length: SUBJECT_SHORT_TITLE_MIN_LENGTH }),
    )
    .max(
      SUBJECT_SHORT_TITLE_MAX_LENGTH,
      t("validations.subject-short-title.max", { length: SUBJECT_SHORT_TITLE_MAX_LENGTH }),
    ),
  description: z.union([
    z.literal(""),
    z
      .string()
      .min(
        SUBJECT_DESCRIPTION_MIN_LENGTH,
        t("validations.subject-description.max", { length: SUBJECT_DESCRIPTION_MIN_LENGTH }),
      )
      .max(
        SUBJECT_DESCRIPTION_MAX_LENGTH,
        t("validations.subject-description.max", { length: SUBJECT_DESCRIPTION_MAX_LENGTH }),
      )
      .nullable()
      .optional(),
  ]),
});

const state = reactive<CreateSubjectDto>({
  title: "",
  shortTitle: "",
  description: null,
});

const { data, refresh } = await useAsyncData(
  `admin-subject-${id.value}`,
  () => $fetch<ReadSubjectDto>(`/api/subjects/${id.value}`),
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

async function onSubmit(e: FormSubmitEvent<CreateSubjectDto | UpdateSubjectDto>) {
  try {
    if (isNew.value) {
      const result = await $fetch("/api/subjects", {
        method: "POST",
        body: e.data,
      });
      router.replace(`/admin/subjects/${result.id}`);
      toast.add({ title: t("pages.admin.subjects.subject-created") });
    } else {
      await $fetch(`/api/subjects/${id.value}`, {
        method: "PUT",
        body: e.data,
      });
      toast.add({ title: t("pages.admin.subjects.subject-updated") });
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
          {{ isNew ? $t("pages.admin.subjects.create-subject") : $t("pages.admin.subjects.edit-subject") }}
        </h2>
      </template>

      <div class="grid gap-4">
        <UFormField :label="$t('pages.admin.subjects.title')" name="title">
          <UInput v-model.trim="state.title" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.subjects.short-title')" name="shortTitle">
          <UInput v-model.trim="state.shortTitle" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.subjects.description')" name="description">
          <UTextarea v-model.trim.nullify="state.description" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex flex-col gap-2 items-center">
          <UButton type="submit" block>
            {{ $t("actions.save") }}
          </UButton>
          <UButton variant="link" color="neutral" block :to="`/admin/subjects/${id}/lessons`">
            {{ $t("pages.admin.subjects.to-lesson-list") }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UForm>
</template>
