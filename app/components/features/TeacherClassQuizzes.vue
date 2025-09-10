<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

const route = useRoute();
const { t } = useI18n();

const classId = computed(() => route.params.class_id);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadTeacherFullClassDto>(`/api/schedule/${classId.value}`);
});

interface ResultDataRow {
  quizId: string;
  id: string;
  name: string;
  startedAt: string;
  completedAt: string;
  status: string;
  score: string;
}

const resultsData = computed<ResultDataRow[]>(() => {
  const students = cls.value?.students;
  const results = cls.value?.quizResults;
  if (!Array.isArray(students) || students.length === 0) {
    return [];
  }
  return students.map(student => {
    const result = results?.find(r => r.userId === student.id);
    const deadlinePassed = result?.deadlineAt ? new Date(result.deadlineAt).getTime() - Date.now() <= 0 : false;
    return {
      quizId: result?.quizId,
      id: student.id,
      name: [student.lastName, student.firstName].join(" "),
      startedAt: result?.startedAt ? dateTimeFormatter.format(new Date(result.startedAt)) : "-",
      completedAt: result?.startedAt ? dateTimeFormatter.format(new Date(result.startedAt)) : "-",
      status: deadlinePassed ? "timeout" : result?.status || "pending",
      score:
        result && result?.score !== null
          ? `${result.score.toFixed(2)}%`
          : t("features.dashboard.schedule.quizzes.waiting"),
    } as ResultDataRow;
  });
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

const quizzes = computed(
  () =>
    cls.value?.lesson.quizzes?.map(quiz => ({
      ...quiz,
      results: resultsData.value?.filter(rd => rd.quizId === quiz.id),
    })) || [],
);

const columns: TableColumn<ResultDataRow>[] = [
  {
    header: t("features.dashboard.schedule.quizzes.user-id"),
    accessorKey: "id",
  },
  {
    header: t("features.dashboard.schedule.quizzes.name"),
    accessorKey: "name",
  },
  {
    header: t("features.dashboard.schedule.quizzes.started-at"),
    accessorKey: "startedAt",
  },
  {
    header: t("features.dashboard.schedule.quizzes.completed-at"),
    accessorKey: "completedAt",
  },
  {
    header: t("features.dashboard.schedule.quizzes.status"),
    accessorKey: "status",
  },
  {
    header: t("features.dashboard.schedule.quizzes.score"),
    accessorKey: "score",
  },
];

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});
</script>

<template>
  <UCard v-for="quiz in quizzes" class="space-y-4 mb-8">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-md font-semibold">{{ quiz.title }}</h3>
        <!-- <UBadge
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
        </UBadge> -->
      </div>
    </template>

    <UTable :columns="columns" :data="quiz.results" />
  </UCard>
</template>
