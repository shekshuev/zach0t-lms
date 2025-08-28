<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({
  layout: "dashboard",
});
const route = useRoute();

const { t } = useI18n();

const classId = computed(() => route.params.class_id as string);
const quizId = computed(() => route.params.quiz_id as string);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId.value}`);
});

const schema = z.object({
  questionId: z.string().uuid(),
  options: z.array(z.string()).min(1, { message: t("validations.quiz-answers.min", { length: 1 }) }),
});

const state = reactive<CreateQuizResultAnswerDto>({
  questionId: "",
  options: [],
});

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});

const quiz = computed(() => cls.value?.lesson?.quizzes?.find?.(q => q.id === quizId.value));

const currentQuestionIndex = ref(0);
const currentQuestion = computed(() => quiz.value?.questions[currentQuestionIndex.value]);

watch(
  currentQuestion,
  newQuestion => {
    if (newQuestion) {
      state.questionId = newQuestion.id;
      state.options = [];
    }
  },
  { immediate: true },
);

async function onSubmit(e: FormSubmitEvent<CreateQuizResultAnswerDto>) {
  console.log("Submitted data:", e.data);
  await $fetch(`/api/schedule/${classId.value}/quiz/${quizId.value}`, {
    method: "POST",
    body: e.data,
  });
}

const handleCheckboxChange = (optionId: string, isChecked: boolean) => {
  if (isChecked) {
    if (!state.options.includes(optionId)) {
      state.options.push(optionId);
    }
  } else {
    const index = state.options.indexOf(optionId);
    if (index > -1) {
      state.options.splice(index, 1);
    }
  }
};

const onSubmitAnswerClicked = () => {
  if (quiz.value?.questions && currentQuestionIndex.value === quiz.value?.questions?.length - 1) {
    currentQuestionIndex.value = 0;
  } else {
    currentQuestionIndex.value++;
  }
};
</script>

<template>
  <UContainer class="max-w-4xl py-8">
    <UForm :schema="schema" :state="state as any" class="flex flex-col gap-8" @submit="onSubmit">
      <UCard v-if="currentQuestion" class="space-y-4">
        <WidgetsTipTapViewer :content="currentQuestion.prompt" />
        <template v-if="currentQuestion.type === 'open'">
          <UTextarea v-model="state.options[0]" class="w-full" />
        </template>
        <template v-if="currentQuestion.type === 'multiple'">
          <UFormField :label="$t('pages.dashboard.schedule.quizzes.options')" name="options">
            <div
              v-for="option in currentQuestion.options"
              :key="option.id"
              class="grid grid-cols-[1fr_auto] gap-4 items-center"
            >
              <WidgetsTipTapViewer :content="option.text" />
              <UCheckbox
                size="xl"
                :model-value="state.options.includes(option.id)"
                @update:model-value="handleCheckboxChange(option.id, $event as boolean)"
              />
            </div>
          </UFormField>
        </template>

        <template #footer>
          <UButton block type="submit">{{ $t("pages.dashboard.schedule.quizzes.submit-answer") }}</UButton>
        </template>
      </UCard>
    </UForm>
  </UContainer>
</template>
