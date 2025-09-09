<script setup lang="ts">
import type { FetchError } from "ofetch";

const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const classId = computed(() => route.params.class_id);

const {
  data: cls,
  error,
  refresh,
} = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadStudentFullClassDto>(`/api/schedule/${classId.value}`);
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

const quizzes = computed(
  () =>
    cls.value?.lesson.quizzes?.map(quiz => {
      const qr = cls.value?.quizResults.find(qr => qr.quizId === quiz.id);
      const deadlinePassed = qr?.deadlineAt ? new Date(qr.deadlineAt).getTime() - Date.now() <= 0 : false;
      return {
        ...quiz,
        status: deadlinePassed ? "timeout" : qr?.status || "pending",
        startedAt: qr?.startedAt ? dateTimeFormatter.format(new Date(qr.startedAt)) : "-",
        completedAt: qr?.startedAt ? dateTimeFormatter.format(new Date(qr.startedAt)) : "-",
        score: qr && qr?.score !== null ? `${qr.score.toFixed(2)}%` : t("features.dashboard.schedule.quizzes.waiting"),
      };
    }) || [],
);

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});

const loading = ref(false);

async function startQuiz(id: string) {
  const quizResult = cls.value?.quizResults?.find?.(qr => qr.quizId === id);
  if (!quizResult) {
    try {
      loading.value = true;
      await $fetch<ReadStudentQuizResultDto>(`/api/schedule/${classId.value}/quiz/${id}/start`, {
        method: "POST",
      });
      refresh();
    } catch (err) {
      const msg = (err as FetchError)?.data?.message || "unknown";
      toast.add({ title: t(`errors.${msg}`), color: "error" });
      return;
    } finally {
      loading.value = false;
    }
  }
  navigateTo(`/schedule/${classId.value}/quizzes/${id}`);
}
</script>

<template>
  <UCard v-for="quiz in quizzes" class="space-y-4 mb-8">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-md font-semibold">{{ quiz.title }}</h3>
        <UBadge
          :color="
            quiz.status === 'pending'
              ? 'warning'
              : quiz.status === 'finished'
                ? 'success'
                : ['banned', 'timeout'].includes(quiz.status)
                  ? 'error'
                  : 'info'
          "
        >
          {{ $t(`shared.quiz-statuses.${quiz.status}`) }}
        </UBadge>
      </div>
    </template>

    <dl class="divide-y divide-gray-200 dark:divide-gray-800">
      <div class="py-3 sm:flex sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
          {{ $t("features.dashboard.schedule.quizzes.started-at") }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">{{ quiz.startedAt }}</dd>
      </div>
      <div class="py-3 sm:flex sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
          {{ $t("features.dashboard.schedule.quizzes.completed-at") }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">{{ quiz.completedAt }}</dd>
      </div>
      <div class="py-3 sm:flex sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
          {{ $t("features.dashboard.schedule.quizzes.score") }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">{{ quiz.score }}</dd>
      </div>
    </dl>

    <template v-if="['pending', 'started'].includes(quiz.status)" #footer>
      <UButton @click="startQuiz(quiz.id)" :loading="loading" block>{{
        $t("features.dashboard.schedule.quizzes.start-quiz")
      }}</UButton>
    </template>
  </UCard>
</template>
