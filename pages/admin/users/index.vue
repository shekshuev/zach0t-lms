<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { h, resolveComponent } from "vue";
import { z } from "zod";
import type { Pageable } from "~/types/shared";
import type { FilterUserDto, ReadUserDto } from "~/types/user";
import { USER_ROLES, USER_STATUSES } from "~/types/user";

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
  username: undefined,
  role: undefined,
  status: undefined,
  group: undefined,
  firstName: undefined,
  lastName: undefined,
});

const filters = reactive<Partial<Omit<FilterUserDto, "page" | "limit">>>(getInitialFilters());

const schema = z.object({
  username: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  group: z.string().optional(),
});

const state = reactive(getInitialFilters());

const { data, status, refresh } = await useAsyncData<Pageable<ReadUserDto>>(
  "users",
  () =>
    $fetch<Pageable<ReadUserDto>>("/api/users", {
      query: {
        page: pagination.value.pageIndex + 1,
        limit: pagination.value.pageSize,
        ...filters,
      } as FilterUserDto,
    }),
  {
    watch: [pagination],
  },
);

function onFilterSubmit() {
  filters.username = state.username || undefined;
  filters.firstName = state.firstName || undefined;
  filters.lastName = state.lastName || undefined;
  filters.role = state.role;
  filters.status = state.status;
  filters.group = state.group || undefined;
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
    header: t("pages.admin.users.id"),
    accessorKey: "id",
  },
  {
    header: t("pages.admin.users.username"),
    accessorKey: "username",
  },
  {
    header: t("pages.admin.users.role"),
    accessorKey: "role",
  },
  {
    header: t("pages.admin.users.status"),
    accessorKey: "status",
  },
  {
    header: t("pages.admin.users.first-name"),
    accessorKey: "firstName",
  },
  {
    header: t("pages.admin.users.last-name"),
    accessorKey: "lastName",
  },
  {
    header: t("pages.admin.users.group"),
    accessorKey: "group",
  },
  {
    header: t("pages.admin.users.reset-password-token"),
    accessorKey: "resetPasswordToken",
  },
  {
    header: t("pages.admin.users.created-at"),
    accessorKey: "createdAt",
    cell: ({ row }) => dayjs(row.getValue("createdAt")).format("DD.MM.YYYY HH:mm:ss"),
  },
  {
    header: t("pages.admin.users.updated-at"),
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
      label: t("pages.admin.users.actions"),
    },
    {
      type: "separator",
    },
    {
      label: t("pages.admin.users.reset-password"),
    },
    {
      label: t("pages.admin.users.edit"),
      type: "link",
      to: `/admin/users/${row.original.id}`,
    },
    {
      label: t("pages.admin.users.delete"),
    },
  ];
}
</script>

<template>
  <div class="space-y-4 container mx-auto py-8">
    <UForm :schema="schema" :state="state" @submit.prevent="onFilterSubmit">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 items-end">
        <UFormField :label="$t('pages.admin.users.username')" name="username">
          <UInput v-model="state.username" :placeholder="$t('pages.admin.users.search-username')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.first-name')" name="firstName">
          <UInput v-model="state.firstName" :placeholder="$t('pages.admin.users.search-first-name')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.last-name')" name="lastName">
          <UInput v-model="state.lastName" :placeholder="$t('pages.admin.users.search-last-name')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.group')" name="group">
          <UInput v-model="state.group" :placeholder="$t('pages.admin.users.search-group')" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.role')" name="role">
          <USelect
            v-model="state.role"
            :items="USER_ROLES as unknown as string[]"
            :placeholder="$t('pages.admin.users.all-roles')"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="$t('pages.admin.users.status')" name="status">
          <USelect
            v-model="state.status"
            :items="USER_STATUSES as unknown as string[]"
            :placeholder="$t('pages.admin.users.all-statuses')"
            class="w-full"
          />
        </UFormField>

        <div class="flex flex-row gap-4 col-span-1 md:col-span-2 xl:col-span-6">
          <UButton type="submit">{{ $t("pages.admin.users.apply-filters") }}</UButton>
          <UButton variant="ghost" @click="clearFilters">{{ $t("pages.admin.users.clear-filters") }}</UButton>
          <UButton icon="i-lucide-plus" class="ml-auto" to="/admin/users/new">{{
            $t("pages.admin.users.new")
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
      :total="table?.tableApi?.getFilteredRowModel().rows.length"
      @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
    />
  </div>
</template>
