<script setup lang="ts">
const route = useRoute();

interface Props {
  classId: string;
}

const { classId } = defineProps<Props>();

const { data: cls, error } = await useAsyncData(`class-${classId}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId}`);
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
});

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});
</script>

<template>
  <UCard v-if="cls" class="space-y-4">
    <template #header>
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold">{{ cls.title || cls.shortTitle }}</h1>
        <UBadge :color="cls.status === 'opened' ? 'success' : 'error'">
          {{ $t(`shared.class-statuses.${cls.status}`) }}
        </UBadge>
      </div>
    </template>

    <dl class="divide-y divide-gray-200 dark:divide-gray-800">
      <div class="py-3 sm:flex sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
          {{ $t("features.dashboard.schedule.begin-at") }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">
          {{ dateTimeFormatter.format(new Date(cls.beginAt)) }}
        </dd>
      </div>

      <div class="py-3 sm:flex sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
          {{ $t("features.dashboard.schedule.end-at") }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">–</dd>
      </div>

      <div class="py-3 sm:flex sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
          {{ $t("features.dashboard.schedule.group") }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">
          {{ cls.group }}
        </dd>
      </div>

      <div class="py-3 sm:flex sm:gap-4">
        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
          {{ $t("features.dashboard.schedule.topic") }}
        </dt>
        <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">
          {{ cls.lesson.topic }}
        </dd>
      </div>
    </dl>

    <template v-if="cls.status === 'opened'" #footer>
      <div class="flex flex-col gap-4">
        <UButton color="primary" block :to="`/schedule/${classId}/content`">
          {{ $t("features.dashboard.schedule.to-content") }}</UButton
        >
        <UButton
          v-if="Array.isArray(cls.lesson.quizzes) && cls.lesson.quizzes.length > 0"
          color="primary"
          block
          :to="`/schedule/${classId}/quizzes`"
        >
          {{ $t("features.dashboard.schedule.to-quizzes") }}</UButton
        >
      </div>
    </template>
  </UCard>
</template>
