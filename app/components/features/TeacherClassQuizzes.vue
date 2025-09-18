<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

const route = useRoute();
const { t } = useI18n();

const classId = computed(() => route.params.class_id);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadTeacherFullClassDto>(`/api/schedule/${classId.value}`);
});

interface DataRow {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string;
  cheatAttempts: number;
  status: string;
  score: string;
}

interface QuizAggregate {
  id: string;
  title: string;
  students: DataRow[];
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

const aggregateData = computed<QuizAggregate[]>(() => {
  const quizzes = cls.value?.lesson.quizzes;
  const students = (cls.value?.students || []) as ReadUserDto[];
  const results = cls.value?.quizResults || [];
  if (!Array.isArray(quizzes) || quizzes.length === 0) {
    return [];
  }
  return quizzes.map(quiz => {
    return {
      id: quiz.id,
      title: quiz.title,
      students: students.map(student => {
        const result = results?.find(r => r.userId === student.id && r.quizId === quiz.id);
        let deadlinePassed = false;
        if (result?.answers && result.answers.length < quiz.questions.length) {
          deadlinePassed = result?.deadlineAt ? new Date(result.deadlineAt).getTime() - Date.now() <= 0 : false;
        }
        let score = "-";
        if (result) {
          if (result.score) {
            score = `${result.score.toFixed(2)}%`;
          } else {
            score = t("features.dashboard.schedule.quizzes.waiting");
          }
        }
        return {
          id: student.id,
          name: [student.lastName, student.firstName].join(" "),
          startedAt: result?.startedAt ? dateTimeFormatter.format(new Date(result.startedAt)) : "-",
          completedAt: result?.startedAt ? dateTimeFormatter.format(new Date(result.startedAt)) : "-",
          cheatAttempts: result?.startedAt ? result?.cheatAttempts : "-",
          status: deadlinePassed ? "timeout" : result?.status || "pending",
          score,
        };
      }),
    };
  }) as QuizAggregate[];
});

const columns: TableColumn<DataRow>[] = [
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
    header: t("features.dashboard.schedule.quizzes.cheat-attempts"),
    accessorKey: "cheatAttempts",
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
  <UCard v-for="quiz in aggregateData" class="space-y-4 mb-8">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-md font-semibold">{{ quiz.title }}</h3>
      </div>
    </template>

    <UTable :columns="columns" :data="quiz.students" />
  </UCard>
</template>
