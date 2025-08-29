<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { FetchError } from "ofetch";
import { h, resolveComponent } from "vue";
import { z } from "zod";
import DateTimePicker from "~/components/ui/DateTimePicker.vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

type Filters = Partial<Omit<FilterClassDto, "page" | "limit">>;

definePageMeta({
  layout: "dashboard",
});

const { t } = useI18n();
const dayjs = useDayjs();
const route = useRoute();

const subjectId = computed(() => route.params.subject_id as string);
const lessonId = computed(() => route.params.lesson_id as string);
const toast = useToast();

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const getInitialFilters = (): Filters => ({
  group: undefined,
  status: undefined,
  beginAt: undefined,
  title: undefined,
  shortTitle: undefined,
  lessonId: lessonId.value,
});

const filters = reactive<Filters>(getInitialFilters());

const schema = z.object({
  group: z.string().optional(),
  status: z.string().optional(),
  beginAt: z.date().optional(),
  title: z.string().optional(),
  shortTitle: z.string().optional(),
});

const state = reactive<Filters>(getInitialFilters());

const { data, status, refresh } = await useAsyncData<Pageable<ReadClassDto>>(
  "lessons",
  () =>
    $fetch<Pageable<ReadClassDto>>("/api/classes", {
      query: {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
        ...filters,
        beginAt: filters.beginAt?.toISOString(),
      } as FilterClassDto,
    }),
  {
    watch: [pagination],
    server: false,
  },
);

function onFilterSubmit() {
  filters.beginAt = state.beginAt || undefined;
  filters.group = state.group || undefined;
  filters.lessonId = state.lessonId;
  filters.shortTitle = state.shortTitle || undefined;
  filters.status = state.status || undefined;
  filters.title = state.title || undefined;
  pagination.value.pageIndex = 0;
  refresh();
}

async function deleteClass(id: string) {
  try {
    await $fetch(`/api/classes/${id}`, {
      method: "DELETE",
    });
    refresh();
    toast.add({ title: t("pages.admin.classes.class-removed") });
  } catch (err) {
    const msg = (err as FetchError)?.data?.message || "unknown";
    toast.add({ title: t(`errors.${msg}`), color: "error" });
  }
}

function clearFilters() {
  Object.assign(state, getInitialFilters());
  Object.assign(filters, getInitialFilters());
  pagination.value.pageIndex = 0;
  refresh();
}

const table = useTemplateRef("table");

const columns: TableColumn<ReadClassDto>[] = [
  {
    header: t("pages.admin.classes.id"),
    accessorKey: "id",
  },
  {
    header: t("pages.admin.classes.title"),
    accessorKey: "title",
  },
  {
    header: t("pages.admin.classes.short-title"),
    accessorKey: "shortTitle",
  },
  {
    header: t("pages.admin.classes.group"),
    accessorKey: "group",
  },
  {
    header: t("pages.admin.classes.status"),
    accessorKey: "status",
  },
  {
    header: t("pages.admin.classes.begin-at"),
    accessorKey: "beginAt",
    cell: ({ row }) => dayjs(row.getValue("beginAt")).format("DD.MM.YYYY HH:mm:ss"),
  },
  {
    header: t("pages.admin.classes.created-at"),
    accessorKey: "createdAt",
    cell: ({ row }) => dayjs(row.getValue("createdAt")).format("DD.MM.YYYY HH:mm:ss"),
  },
  {
    header: t("pages.admin.classes.updated-at"),
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

function getRowItems(row: Row<ReadClassDto>) {
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
      to: `/admin/subjects/${subjectId.value}/lessons/${lessonId.value}/classes/${row.original.id}`,
    },
    {
      label: t("actions.delete"),
      onSelect: () => deleteClass(row.original.id),
    },
  ];
}
</script>

<template>
  <div class="space-y-4 container mx-auto py-8">
    <UForm :schema="schema" :state="state" @submit.prevent="onFilterSubmit">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-end">
        <UFormField :label="$t('pages.admin.classes.title')" name="topic">
          <UInput v-model="state.title" :placeholder="$t('pages.admin.classes.search-title')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.short-title')" name="topic">
          <UInput
            v-model="state.shortTitle"
            :placeholder="$t('pages.admin.classes.search-short-title')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.group')" name="topic">
          <UInput v-model="state.group" :placeholder="$t('pages.admin.classes.group')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.status')" name="status">
          <USelect
            v-model="state.status"
            :items="CLASS_STATUSES as unknown as string[]"
            :placeholder="$t('pages.admin.classes.all-statuses')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.begin-at')" name="beginAt">
          <DateTimePicker v-model="state.beginAt" class="w-full" :placeholder="$t('pages.admin.classes.all-dates')" />
        </UFormField>

        <div class="flex flex-row gap-4 col-span-1 md:col-span-1 lg:col-span-3 xl:col-span-5">
          <UButton type="submit">{{ $t("actions.apply-filters") }}</UButton>
          <UButton variant="ghost" @click="clearFilters">{{ $t("actions.clear-filters") }}</UButton>
          <UButton
            icon="i-lucide-plus"
            class="ml-auto"
            :to="`/admin/subjects/${subjectId}/lessons/${lessonId}/classes/new`"
          >
            {{ $t("actions.new") }}
          </UButton>
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
