<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  Time,
  toCalendarDateTime,
  toZoned,
} from "@internationalized/date";
import { vMaska } from "maska/vue";

const props = defineProps<{
  modelValue?: Date;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value?: Date): void;
}>();

const calendarValue = ref<CalendarDate>() as Ref<DateValue | undefined>;
const timeValue = ref("12:00");

const formatter = new DateFormatter("ru", {
  dateStyle: "short",
  timeStyle: "short",
});

const zonedDate = computed(() => {
  if (!calendarValue.value || !timeValue.value) return null;

  const [h, m] = timeValue.value.split(":").map(Number);
  const time = new Time(h, m);

  const dateTime = toCalendarDateTime(calendarValue.value as CalendarDate, time);
  return toZoned(dateTime, getLocalTimeZone());
});

const formatted = computed(() => (zonedDate.value ? formatter.format(zonedDate.value.toDate()) : ""));

const internalUpdate = ref(false);

watch(
  () => props.modelValue,
  value => {
    if (internalUpdate.value) return;
    if (value) {
      const d = new Date(value);
      calendarValue.value = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
      timeValue.value = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } else {
      calendarValue.value = undefined;
      timeValue.value = "12:00";
    }
  },
  { immediate: true },
);

watch([calendarValue, timeValue], () => {
  const date = zonedDate.value?.toDate();
  internalUpdate.value = true;
  emit("update:modelValue", date);
  requestAnimationFrame(() => {
    internalUpdate.value = false;
  });
});
</script>

<template>
  <UPopover>
    <UInput
      :value="formatted"
      readonly
      type="text"
      :placeholder="props.placeholder || $t(`ui.date-time-picker.empty`)"
    />

    <template #content>
      <div class="flex flex-col gap-2 p-2 w-64">
        <UCalendar v-model="calendarValue" />
        <UInput
          v-model="timeValue"
          v-maska="`##:##`"
          :placeholder="$t('ui.date-time-picker.time-placeholder')"
          autocomplete="off"
          trailing-icon="i-lucide-clock"
        />
      </div>
    </template>
  </UPopover>
</template>
