<script setup lang="ts">
import type { FilterUserDto, ReadUserDto } from "~/types/user";
import type { Pageable } from "~/types/shared";
import { getPaginationRowModel } from "@tanstack/vue-table";
import { z } from "zod";

definePageMeta({
  layout: "dashboard",
});

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

const getInitialFilters = () => ({
  username: undefined,
  role: undefined,
  status: undefined,
  firstName: undefined,
  lastName: undefined,
});

const filters = reactive<Partial<Omit<FilterUserDto, "page" | "limit">>>(getInitialFilters());

const schema = z.object({
  username: z.string().optional(),
  role: z.enum(["admin", "user", "teacher"]).optional(),
  status: z.enum(["active", "blocked", "created"]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const state = reactive(getInitialFilters());

const { data, status, refresh } = await useAsyncData<Pageable<ReadUserDto>>(
  "users",
  () =>
    $fetch("/api/user", {
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
  filters.role = state.role;
  filters.status = state.status;
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
</script>

<template>
  <div class="w-full space-y-4">
    <UForm :schema="schema" :state="state" @submit.prevent="onFilterSubmit">
      <div class="flex gap-4 flex-wrap items-end">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" :placeholder="$t('pages.admin.users.search-username')" />
        </UFormField>

        <UFormField label="Role" name="role">
          <USelect
            v-model="state.role"
            :items="['admin', 'user', 'teacher']"
            :placeholder="$t('pages.admin.users.all-roles')"
          />
        </UFormField>

        <UFormField label="Status" name="status">
          <USelect
            v-model="state.status"
            :items="['active', 'blocked', 'created']"
            :placeholder="$t('pages.admin.users.all-statuses')"
          />
        </UFormField>

        <UButton type="submit">{{ $t("pages.admin.users.apply-filters") }}</UButton>
        <UButton variant="ghost" @click="clearFilters">{{ $t("pages.admin.users.clear-filters") }}</UButton>
      </div>
    </UForm>
    <UTable
      ref="table"
      v-model:pagination="pagination"
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
