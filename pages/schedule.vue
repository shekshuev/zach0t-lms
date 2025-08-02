<script setup lang="ts">
import { useAsyncData } from "#app";
import ScheduleCalendar from "~/components/widgets/ScheduleCalendar.vue";
import type { FilterScheduleDto, ReadClassDto } from "~/types/class";
definePageMeta({
  layout: "dashboard",
});

const date = ref(new Date());

const startOfMonth = computed(() => {
  return new Date(date.value.getFullYear(), date.value.getMonth(), 1);
});

const endOfMonth = computed(() => {
  return new Date(date.value.getFullYear(), date.value.getMonth() + 1, 0);
});

const { data: classes } = await useAsyncData<ReadClassDto[]>(
  `classes-${date.value}`,
  () =>
    $fetch<ReadClassDto[]>("/api/schedule", {
      query: {
        from: startOfMonth.value.toISOString(),
        to: endOfMonth.value.toISOString(),
      } satisfies FilterScheduleDto,
    }),
  {
    server: false,
  },
);
</script>

<template>
  <div class="container mx-auto py-8">
    <ScheduleCalendar
      :classes="classes || []"
      :month="date.getMonth() + 1"
      :year="date.getFullYear()"
      @next-month="date = new Date(date.getFullYear(), date.getMonth() + 1)"
      @prev-month="date = new Date(date.getFullYear(), date.getMonth() - 1)"
    />
  </div>
</template>
