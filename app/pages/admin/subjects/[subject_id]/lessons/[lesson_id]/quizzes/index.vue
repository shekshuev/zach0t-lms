<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { h, resolveComponent } from "vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

definePageMeta({
  layout: "dashboard",
});

const { t } = useI18n();
const route = useRoute();

const subjectId = computed(() => route.params.subject_id as string);
const lessonId = computed(() => route.params.lesson_id as string);

const { data, status } = await useAsyncData(`admin-lesson-${lessonId.value}`, () =>
  $fetch<ReadLessonDto>(`/api/lessons/${lessonId.value}`),
);

const quizzes = computed(() => data.value?.quizzes || []);

const columns: TableColumn<Quiz>[] = [
  {
    header: t("pages.admin.quizzes.id"),
    accessorKey: "id",
  },
  {
    header: t("pages.admin.quizzes.title"),
    accessorKey: "title",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            content: {
              align: "end",
            },
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              variant: "ghost",
            }),
        ),
      );
    },
  },
];

function getRowItems(row: Row<Quiz>) {
  return [
    {
      type: "label",
      label: t("actions.header"),
    },
    {
      type: "separator",
    },
    {
      label: t("actions.edit"),
      type: "link",
      to: `/admin/subjects/${subjectId.value}/lessons/${lessonId.value}/quizzes/${row.original.id}`,
    },
    {
      label: t("actions.delete"),
    },
  ];
}
</script>

<template>
  <div class="space-y-4 container mx-auto py-8">
    <div class="flex flex-row-reverse">
      <UButton
        icon="i-lucide-plus"
        class="ml-auto"
        :to="`/admin/subjects/${subjectId}/lessons/${lessonId}/quizzes/new`"
      >
        {{ $t("actions.new") }}
      </UButton>
    </div>
    <UTable :columns="columns" :data="quizzes" :loading="status === 'pending'" />
  </div>
</template>
