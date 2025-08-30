<script setup lang="ts">
import type { DropdownMenuItem, FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import { v4 } from "uuid";
import { z } from "zod";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const lessonId = computed(() => route.params.lesson_id as string);
const subjectId = computed(() => route.params.subject_id as string);
const quizId = computed(() => route.params.quiz_id as string);
const isNew = computed(() => route.params.quiz_id === "new");

const { data } = await useAsyncData(`admin-lesson-${lessonId.value}`, () =>
  $fetch<ReadLessonDto>(`/api/lessons/${lessonId.value}`),
);

const quizzes = computed(() => data.value?.quizzes || []);

const quiz = computed(() => {
  if (Array.isArray(quizzes.value)) {
    return quizzes.value.find(q => q.id === quizId.value) || null;
  } else {
    return null;
  }
});

const quizOptionSchema = z.object({
  id: z.string().uuid(),
  text: z.object({}).passthrough(),
  isCorrect: z.boolean().optional(),
});

const quizQuestionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(QUIZ_QUESTION_TYPES),
  prompt: z.object({}).passthrough(),
  options: z.array(quizOptionSchema).optional().default([]),
});

const schema = z.object({
  title: z
    .string({ message: t("validations.quiz-title.required") })
    .min(LESSON_QUIZ_TITLE_MIN_LENGTH, t("validations.quiz-title.min", { length: LESSON_QUIZ_TITLE_MIN_LENGTH }))
    .max(LESSON_QUIZ_TITLE_MAX_LENGTH, t("validations.quiz-title.max", { length: LESSON_QUIZ_TITLE_MAX_LENGTH })),
  questions: z.array(quizQuestionSchema),
});

const state = reactive<Quiz>({
  id: v4(),
  title: "",
  questions: [],
});

const items = ref<DropdownMenuItem[][]>([
  [
    {
      label: t("pages.admin.quizzes.add-multiple-question"),
      icon: "i-lucide-square-check",
      onSelect: () =>
        state.questions.push({
          id: v4(),
          type: "multiple",
          prompt: {
            text: "",
          },
          options: [],
        }),
    },
    {
      label: t("pages.admin.quizzes.add-open-question"),
      icon: "i-lucide-text",
      onSelect: () =>
        state.questions.push({
          id: v4(),
          type: "open",
          prompt: {},
        }),
    },
  ],
]);

watch(
  quiz,
  newValue => {
    if (newValue) {
      Object.assign(state, newValue);
    }
  },
  {
    immediate: true,
  },
);

async function onSubmit(e: FormSubmitEvent<Quiz>) {
  try {
    let payloadQuizzes;
    if (isNew.value) {
      payloadQuizzes = [...quizzes.value, e.data];
    } else {
      payloadQuizzes = quizzes.value.map(q => (q.id === e.data.id ? e.data : q));
    }
    await $fetch(`/api/lessons/${lessonId.value}`, {
      method: "PUT",
      body: {
        ...data.value,
        subjectId: subjectId.value,
        quizzes: payloadQuizzes,
      },
    });
    if (isNew.value) {
      router.replace(`/admin/subjects/${subjectId.value}/lessons/${lessonId.value}/quizzes/${e.data.id}`);
      toast.add({ title: t("pages.admin.quizzes.quiz-created") });
    } else {
      toast.add({ title: t("pages.admin.quizzes.quiz-updated") });
    }
  } catch (err) {
    const msg = (err as FetchError)?.data?.message || "unknown";
    toast.add({ title: t(`errors.${msg}`), color: "error" });
  }
}
</script>

<template>
  <div class="container mx-auto py-8">
    <UForm :schema="schema" :state="state as any" class="flex flex-col gap-8" @submit="onSubmit">
      <UCard class="max-w-xl w-full space-y-4 mx-auto">
        <template #header>
          <h2 class="text-2xl font-bold text-center">
            {{ isNew ? $t("pages.admin.quizzes.create-quiz") : $t("pages.admin.quizzes.edit-quiz") }}
          </h2>
        </template>

        <div class="grid gap-4">
          <UFormField :label="$t('pages.admin.quizzes.title')" name="title">
            <UInput v-model.trim="state.title" class="w-full" />
          </UFormField>
        </div>
      </UCard>

      <UCard v-for="question in state.questions" :key="question.id" class="max-w-xl w-full space-y-4 mx-auto">
        <template #header>
          <div class="flex items-center justify-between">
            <UBadge color="primary">{{ question.type }}</UBadge>
            <UButton
              icon="i-lucide-x"
              size="xs"
              @click="() => void (state.questions = state.questions.filter(q => q.id !== question.id))"
            />
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <UFormField :label="$t('pages.admin.quizzes.prompt')" name="prompt">
            <WidgetsTipTapEditor v-model="question.prompt" />
          </UFormField>
          <template v-if="['multiple'].includes(question.type)">
            <div
              class="grid items-start grid-cols-[1fr_auto_auto] gap-2"
              v-for="option in question.options"
              :key="option.id"
            >
              <UFormField :label="$t('pages.admin.quizzes.option')" name="option">
                <WidgetsTipTapEditor v-model="option.text" />
              </UFormField>
              <UTooltip :text="$t('pages.admin.quizzes.is-correct')">
                <UCheckbox size="lg" v-model="option.isCorrect" />
              </UTooltip>
              <UButton
                icon="i-lucide-x"
                size="xs"
                @click="() => void (question.options = question.options?.filter(o => o.id !== option.id))"
              />
            </div>

            <UButton block icon="i-lucide-plus" @click="() => void question.options?.push({ id: v4(), text: {} })">
              {{ $t("pages.admin.quizzes.add-option") }}
            </UButton>
          </template>
        </div>
      </UCard>

      <div class="flex flex-col max-w-xl w-full space-y-2 mx-auto">
        <UDropdownMenu :items="items">
          <UButton block icon="i-lucide-plus" color="neutral" variant="ghost">
            {{ $t("pages.admin.quizzes.add-question") }}
          </UButton>
        </UDropdownMenu>
        <UButton block type="submit">
          {{ $t("actions.save") }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>
