<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { h, resolveComponent } from "vue";
import { z } from "zod";
import type { Pageable } from "~/types/shared";
import type { FilterSubjectDto } from "~/types/subject";
import type { ReadUserDto } from "~/types/user";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

definePageMeta({
  layout: "dashboard",
});

const { t } = useI18n();
const dayjs = useDayjs();

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const getInitialFilters = () => ({
  title: undefined,
  shortTitle: undefined,
});

const filters = reactive<Partial<Omit<FilterSubjectDto, "page" | "limit">>>(getInitialFilters());

const schema = z.object({
  title: z.string().optional(),
  shortTitle: z.string().optional(),
});

const state = reactive(getInitialFilters());

const { data, status, refresh } = await useAsyncData<Pageable<ReadUserDto>>(
  "subjects",
  () =>
    $fetch<Pageable<ReadUserDto>>("/api/subjects", {
      query: {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
        ...filters,
      } as FilterSubjectDto,
    }),
  {
    watch: [pagination],
  },
);

function onFilterSubmit() {
  filters.title = state.title || undefined;
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

const columns: TableColumn<ReadUserDto>[] = [
  {
    header: t("pages.admin.subjects.id"),
    accessorKey: "id",
  },
  {
    header: t("pages.admin.subjects.title"),
    accessorKey: "title",
  },
  {
    header: t("pages.admin.subjects.short-title"),
    accessorKey: "shortTitle",
  },
  {
    header: t("pages.admin.subjects.created-at"),
    accessorKey: "createdAt",
    cell: ({ row }) => dayjs(row.getValue("createdAt")).format("DD.MM.YYYY HH:mm:ss"),
  },
  {
    header: t("pages.admin.subjects.updated-at"),
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

function getRowItems(row: Row<ReadUserDto>) {
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
      to: `/admin/subjects/${row.original.id}`,
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
        <UFormField :label="$t('pages.admin.subjects.title')" name="title">
          <UInput v-model="state.title" :placeholder="$t('pages.admin.subjects.search-title')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.subjects.short-title')" name="shortTitle">
          <UInput
            v-model="state.shortTitle"
            :placeholder="$t('pages.admin.subjects.search-short-title')"
            class="w-full"
          />
        </UFormField>

        <div class="flex flex-row gap-4 col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-4">
          <UButton type="submit">{{ $t("actions.apply-filters") }}</UButton>
          <UButton variant="ghost" @click="clearFilters">{{ $t("actions.clear-filters") }}</UButton>
          <UButton icon="i-lucide-plus" class="ml-auto" to="/admin/subjects/new">{{ $t("actions.new") }}</UButton>
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
      :total="table?.tableApi?.getFilteredRowModel().rows.length"
      @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
    />
  </div>
</template>
