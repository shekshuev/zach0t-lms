<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { h, resolveComponent } from "vue";
import { z } from "zod";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

type Filters = Partial<Omit<FilterLessonDto, "page" | "limit">>;

definePageMeta({
  layout: "dashboard",
});

const { t } = useI18n();
const dayjs = useDayjs();
const route = useRoute();

const subjectId = computed(() => route.params.subject_id as string);

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const getInitialFilters = (): Filters => ({
  topic: "",
  subjectId: subjectId.value,
});

const filters = reactive<Filters>(getInitialFilters());

const schema = z.object({
  topic: z.string().optional(),
});

const state = reactive<Filters>(getInitialFilters());

const { data, status, refresh } = await useAsyncData<Pageable<ReadLessonDto>>(
  "lessons",
  () =>
    $fetch<Pageable<ReadLessonDto>>("/api/lessons", {
      query: {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
        ...filters,
      } as FilterLessonDto,
    }),
  {
    watch: [pagination],
    server: false,
  },
);

function onFilterSubmit() {
  filters.topic = state.topic || undefined;
  pagination.value.pageIndex = 0;
  refresh();
}

function clearFilters() {
  Object.assign(state, getInitialFilters());
  Object.assign(filters, getInitialFilters());
  pagination.value.pageIndex = 0;
  refresh();
}

const table = useTemplateRef("table");

const columns: TableColumn<ReadLessonDto>[] = [
  {
    header: t("pages.admin.lessons.id"),
    accessorKey: "id",
  },
  {
    header: t("pages.admin.lessons.topic"),
    accessorKey: "topic",
  },
  {
    header: t("pages.admin.lessons.hours"),
    accessorKey: "hours",
  },
  {
    header: t("pages.admin.lessons.created-at"),
    accessorKey: "createdAt",
    cell: ({ row }) => dayjs(row.getValue("createdAt")).format("DD.MM.YYYY HH:mm:ss"),
  },
  {
    header: t("pages.admin.lessons.updated-at"),
    accessorKey: "updatedAt",
    cell: ({ row }) => dayjs(row.getValue("updatedAt")).format("DD.MM.YYYY HH:mm:ss"),
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

function getRowItems(row: Row<ReadLessonDto>) {
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
      to: `/admin/subjects/${subjectId.value}/lessons/${row.original.id}`,
    },
    {
      label: t("actions.delete"),
    },
  ];
}
</script>

<template>
  <div class="space-y-4 container mx-auto py-8">
    <UForm :schema="schema" :state="state" @submit.prevent="onFilterSubmit">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 items-end">
        <UFormField :label="$t('pages.admin.lessons.topic')" name="topic">
          <UInput v-model="state.topic" :placeholder="$t('pages.admin.lessons.search-topic')" class="w-full" />
        </UFormField>

        <div class="flex flex-row gap-4 col-span-1 md:col-span-1 lg:col-span-3 xl:col-span-5">
          <UButton type="submit">{{ $t("actions.apply-filters") }}</UButton>
          <UButton variant="ghost" @click="clearFilters">{{ $t("actions.clear-filters") }}</UButton>
          <UButton icon="i-lucide-plus" class="ml-auto" :to="`/admin/subjects/${subjectId}/lessons/new`">{{
            $t("actions.new")
          }}</UButton>
        </div>
      </div>
    </UForm>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      :columns="columns"
      :data="data?.items || []"
      :loading="status === 'pending'"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    />
    <UPagination
      :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
      :items-per-page="table?.tableApi?.getState().pagination.pageSize"
      :total="data?.total || 0"
      @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
    />
  </div>
</template>
