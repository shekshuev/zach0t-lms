<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { CalendarDate, DateFormatter, endOfWeek, isSameDay, startOfWeek, today } from "@internationalized/date";

const {
  classes,
  month,
  year,
  locale = "en-US",
} = defineProps<{
  classes: ReadClassDto[];
  month: number;
  year: number;
  locale?: string;
}>();

const emit = defineEmits<{
  (e: "prev-month" | "next-month"): void;
  (e: "class-click", classId: string): void;
}>();

const current = ref<CalendarDate>(new CalendarDate(year, month, 1));
const formatter = new DateFormatter(locale, { month: "long", year: "numeric" });

const weekDays = computed(() => {
  const formatter = new DateFormatter(locale, { weekday: "short" });
  const start = startOfWeek(today("UTC"), locale);

  return Array.from({ length: 7 }, (_, i) => {
    const day = start.add({ days: i });
    return formatter.format(day.toDate("UTC"));
  });
});

const monthLabel = computed(() => formatter.format(current.value.toDate("UTC")));

function prevMonth() {
  const date = current.value;
  current.value = date.subtract({ months: 1 });
  emit("prev-month");
}

function nextMonth() {
  const date = current.value;
  current.value = date.add({ months: 1 });
  emit("next-month");
}

const calendarDates = computed(() => {
  const start = startOfWeek(current.value as DateValue, locale);
  const end = endOfWeek(current.value.add({ months: 1 }).subtract({ days: 1 }), locale);
  const days = [];
  let d = start;
  while (d.compare(end) <= 0) {
    days.push(d);
    d = d.add({ days: 1 });
  }
  return days as CalendarDate[];
});

function isToday(date: CalendarDate) {
  return isSameDay(date, today("UTC"));
}

function isCurrentMonth(date: CalendarDate) {
  return date.month === current.value.month && date.year === current.value.year;
}

function getLessonsByDate(date: CalendarDate) {
  const iso = date.toDate("UTC").toISOString().slice(0, 10);
  return classes.filter(cls => cls.beginAt.startsWith(iso));
}
</script>

<template>
  <div class="grid gap-5">
    <div class="flex items-center justify-start gap-4">
      <UButton icon="i-lucide-chevron-left" color="primary" variant="soft" @click="prevMonth" />
      <h2 class="text-xl font-semibold capitalize">{{ monthLabel }}</h2>
      <UButton icon="i-lucide-chevron-right" color="primary" variant="soft" @click="nextMonth" />
    </div>

    <div class="grid grid-cols-7 gap-2">
      <div v-for="day in weekDays" :key="day" class="text-center text-sm font-medium text-neutral-500">{{ day }}</div>
      <div
        v-for="date in calendarDates"
        :key="date.toString()"
        class="aspect-square flex flex-col items-center justify-start gap-2 p-1 rounded-xl text-sm transition"
        :class="{
          'text-neutral-400': !isCurrentMonth(date),
          'bg-neutral-50 dark:bg-neutral-800': isCurrentMonth(date),
        }"
      >
        <span
          class="w-8 h-8 flex justify-center items-center rounded-full"
          :class="{
            'text-primary font-bold bg-primary-100 dark:bg-primary-900 ': isToday(date),
          }"
        >
          {{ date.day }}
        </span>
        <div class="flex flex-col w-full gap-2">
          <UBadge
            v-for="cls in getLessonsByDate(date)"
            :key="cls.id"
            size="xs"
            :color="cls.status === 'opened' ? 'success' : 'error'"
            variant="soft"
            class="w-full cursor-pointer truncate text-[10px] px-2"
            @click="emit('class-click', cls.id)"
          >
            {{ cls.shortTitle }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>
