<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const route = useRoute();

const classId = computed(() => route.params.class_id);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId.value}`);
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

const quizzes = computed(
  () =>
    cls.value?.lesson.quizzes?.map(quiz => {
      const qr = cls.value?.quizResults.find(qr => qr.quizId === quiz.id);
      return {
        ...quiz,
        status: qr?.status || "pending",
        startedAt: qr?.startedAt ? dateTimeFormatter.format(new Date(qr.startedAt)) : "-",
        completedAt: qr?.startedAt ? dateTimeFormatter.format(new Date(qr.startedAt)) : "-",
        score: qr?.score || "-",
      };
    }) || [],
);

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});
</script>

<template>
  <UContainer class="max-w-4xl py-8">
    <UCard v-for="quiz in quizzes" class="space-y-4">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-md font-semibold">{{ quiz.title }}</h3>
          <UBadge :color="quiz.status === 'pending' ? 'warning' : quiz.status === 'finished' ? 'success' : 'info'">
            {{ $t(`shared.quiz-statuses.${quiz.status}`) }}
          </UBadge>
        </div>
      </template>

      <dl class="divide-y divide-gray-200 dark:divide-gray-800">
        <div class="py-3 sm:flex sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
            {{ $t("pages.dashboard.schedule.quizzes.started-at") }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">{{ quiz.startedAt }}</dd>
        </div>
        <div class="py-3 sm:flex sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
            {{ $t("pages.dashboard.schedule.quizzes.completed-at") }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">{{ quiz.completedAt }}</dd>
        </div>
        <div class="py-3 sm:flex sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
            {{ $t("pages.dashboard.schedule.quizzes.score") }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">{{ quiz.score }}</dd>
        </div>
      </dl>

      <template #footer>
        <UButton :to="`/schedule/${classId}/quizzes/${quiz.id}`" block>{{
          $t("pages.dashboard.schedule.quizzes.start-quiz")
        }}</UButton>
      </template>
    </UCard>
  </UContainer>
</template>
