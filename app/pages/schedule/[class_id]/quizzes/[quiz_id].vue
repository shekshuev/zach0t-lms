<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
const route = useRoute();

const classId = computed(() => route.params.class_id);
const quizId = computed(() => route.params.quiz_id);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId.value}`);
});

const quiz = computed(() => cls.value?.lesson?.quizzes?.find?.(q => q.id === quizId.value));

const currentQuestionIndex = ref(0);
const currentQuestion = computed(() => quiz.value?.questions[currentQuestionIndex.value]);

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
    <UCard v-if="currentQuestion" class="space-y-4">
      <WidgetsTipTapViewer :content="currentQuestion.prompt" />
      <template v-if="currentQuestion.type === 'open'">
        <UTextarea />
      </template>
      <template v-if="currentQuestion.type === 'multiple'">
        <div
          v-for="option in currentQuestion.options"
          :key="option.id"
          class="grid grid-cols-[1fr_auto] gap-4 items-center"
        >
          <WidgetsTipTapViewer :content="option.text" />
          <UCheckbox size="xl" />
        </div>
      </template>

      <template #footer>
        <UButton block @click="onSubmitAnswerClicked">{{
          $t("pages.dashboard.schedule.quizzes.submit-answer")
        }}</UButton>
      </template>
    </UCard>
  </UContainer>
</template>
