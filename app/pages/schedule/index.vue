<script setup lang="ts">
import { useAsyncData } from "#app";
import { CalendarDate, endOfMonth, startOfMonth, today } from "@internationalized/date";

definePageMeta({
  layout: "dashboard",
});

const date = ref(today("UTC"));

const startOfSelectedMonth = computed(() => {
  return startOfMonth(date.value as CalendarDate).toString();
});

const endOfSelectedMonth = computed(() => {
  return endOfMonth(date.value as CalendarDate).toString();
});
const key = computed(() => `classes-${date.value}`);

const { data: classes } = await useAsyncData<ReadClassDto[]>(
  key,
  () =>
    $fetch<ReadClassDto[]>("/api/schedule", {
      query: {
        from: startOfSelectedMonth.value,
        to: endOfSelectedMonth.value,
      } satisfies FilterScheduleDto,
    }),
  {
    server: false,
  },
);
</script>

<template>
  <UContainer class="max-w-4xl py-8">
    <WidgetsScheduleCalendar
      :classes="classes || []"
      :month="date.month"
      :year="date.year"
      @next-month="date = date.add({ months: 1 })"
      @prev-month="date = date.add({ months: -1 })"
      @class-click="navigateTo(`/schedule/${$event}`)"
    />
  </UContainer>
</template>
