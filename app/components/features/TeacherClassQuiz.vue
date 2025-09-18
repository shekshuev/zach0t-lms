<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { t } = useI18n();

const classId = computed(() => route.params.class_id as string);
const quizId = computed(() => route.params.quiz_id as string);

const userId = computed(() => route.query.userId as string);

watchEffect(() => {
  if (!userId.value) {
    router.replace(`/schedule/${classId.value}/quizzes`);
  }
});

const {
  data: cls,
  error,
  status,
} = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadTeacherFullClassDto>(`/api/schedule/${classId.value}`);
});

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});

const quiz = computed(() => cls.value?.lesson?.quizzes?.find?.(q => q.id === quizId.value));

const aggregateData = computed(() => {
  const quiz = cls.value?.lesson.quizzes?.find?.(q => q.id === quizId.value);
  if (!quiz) {
    return null;
  }
  const student = cls.value?.students?.find?.(s => s.id === userId.value);
  if (!student) {
    return null;
  }
  const results = cls.value?.quizResults.find(qr => qr.userId === userId.value && qr.quizId === quizId.value);
  if (!results) {
    return null;
  }
  return {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map(q => ({
      ...q,
      result: results.answers.find(a => a.questionId === q.id),
    })),
    student,
  };
});

console.log(aggregateData.value);
</script>

<template>
  <!-- <UCard class="space-y-4">
    <USkeleton class="h-24 w-full" v-if="status === 'pending'" />
    <WidgetsTipTapViewer v-else :content="currentQuestion.prompt" />

    <template v-if="status === 'pending'">
      <div class="grid grid-cols-[1fr_20px] gap-4 items-center">
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
        <USkeleton class="h-6" />
      </div>
    </template>

    <template v-else-if="currentQuestion.type === 'open'">
      <UFormField :label="$t('features.dashboard.schedule.quizzes.options')" name="options">
        <UTextarea v-model="state.options[0]" class="w-full" />
      </UFormField>
    </template>

    <template v-else-if="currentQuestion.type === 'multiple'">
      <UFormField :label="$t('features.dashboard.schedule.quizzes.options')" name="options">
        <div
          v-for="option in currentQuestion.options"
          :key="option.id"
          class="grid grid-cols-[1fr_auto] gap-4 items-center"
        >
          <WidgetsTipTapViewer :content="option.text" />
          <UCheckbox size="xl" :disabled="loading" :model-value="state.options.includes(option.id)" />
        </div>
      </UFormField>
    </template>

    <template #footer>
      <USkeleton v-if="status === 'pending'" class="h-8 w-full" />
      <UButton v-else block :loading="loading">
        {{ $t("features.dashboard.schedule.quizzes.submit-answer") }}
      </UButton>
    </template>
  </UCard> -->
</template>
