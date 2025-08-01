<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import { z } from "zod";
import type { CreateLessonDto, UpdateLessonDto } from "~/types/lesson";
import type { ReadSubjectDto } from "~/types/subject";

definePageMeta({ layout: "dashboard" });

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isNew = computed(() => route.params.lesson_id === "new");
const lessonId = computed(() => route.params.lesson_id as string);
const subjectId = computed(() => route.params.subject_id as string);

const schema = z.object({
  topic: z
    .string({ message: t("validations.lesson-topic.required") })
    .min(LESSON_TOPIC_MIN_LENGTH, t("validations.lesson-topic.min", { length: LESSON_TOPIC_MIN_LENGTH }))
    .max(LESSON_TOPIC_MAX_LENGTH, t("validations.lesson-topic.min", { length: LESSON_TOPIC_MAX_LENGTH })),
  hours: z
    .number({ message: t("validations.lesson-hours.required") })
    .positive({ message: t("validations.lesson-hours.positive") }),
});

const state = reactive<CreateLessonDto | UpdateLessonDto>({
  topic: "",
  hours: 2,
  subjectId: subjectId.value,
});

const { data, refresh } = await useAsyncData(
  `admin-lesson-${lessonId.value}`,
  () => $fetch<ReadSubjectDto>(`/api/lessons/${lessonId.value}`),
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

async function onSubmit(e: FormSubmitEvent<CreateLessonDto | UpdateLessonDto>) {
  try {
    if (isNew.value) {
      const result = await $fetch("/api/lessons", {
        method: "POST",
        body: {
          ...e.data,
          subjectId: subjectId.value,
        },
      });
      router.replace(`/admin/subjects/${subjectId.value}/lessons/${result.id}`);
      toast.add({ title: t("pages.admin.lessons.lesson-created") });
    } else {
      await $fetch(`/api/lessons/${lessonId.value}`, {
        method: "PUT",
        body: {
          ...e.data,
          subjectId: subjectId.value,
        },
      });
      toast.add({ title: t("pages.admin.lessons.lesson-updated") });
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
          {{ isNew ? $t("pages.admin.lessons.create-lesson") : $t("pages.admin.lessons.edit-lesson") }}
        </h2>
      </template>

      <div class="grid gap-4">
        <UFormField :label="$t('pages.admin.lessons.topic')" name="topic">
          <UInput v-model.trim="state.topic" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.lessons.hours')" name="hours">
          <UInput v-model.number="state.hours" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex flex-col gap-2 items-center">
          <UButton type="submit" block>
            {{ $t("actions.save") }}
          </UButton>
          <UButton
            v-if="!isNew"
            variant="link"
            color="neutral"
            block
            :to="`/admin/subjects/${subjectId}/lessons/${lessonId}/content`"
          >
            {{ $t("pages.admin.lessons.edit-content") }}
          </UButton>
          <UButton
            v-if="!isNew"
            variant="link"
            color="neutral"
            block
            :to="`/admin/subjects/${subjectId}/lessons/${lessonId}/classes`"
          >
            {{ $t("pages.admin.lessons.to-lesson-classes") }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UForm>
</template>
