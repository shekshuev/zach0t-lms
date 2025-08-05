<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const route = useRoute();

const classId = computed(() => route.params.class_id);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId.value}`);
});

function goToContent() {
  navigateTo(`/schedule/${classId.value}/content`);
}

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
  <UContainer class="max-w-4xl py-8">
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
            {{ $t("pages.dashboard.schedule.begin-at") }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">
            {{ dateTimeFormatter.format(new Date(cls.beginAt)) }}
          </dd>
        </div>

        <div class="py-3 sm:flex sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
            {{ $t("pages.dashboard.schedule.end-at") }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">–</dd>
        </div>

        <div class="py-3 sm:flex sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
            {{ $t("pages.dashboard.schedule.group") }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">
            {{ cls.group }}
          </dd>
        </div>

        <div class="py-3 sm:flex sm:gap-4">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 w-48">
            {{ $t("pages.dashboard.schedule.topic") }}
          </dt>
          <dd class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0">
            {{ cls.lesson.topic }}
          </dd>
        </div>
      </dl>

      <template v-if="cls.status === 'opened'" #footer>
        <UButton color="primary" block @click="goToContent"> {{ $t("pages.dashboard.schedule.to-content") }}</UButton>
      </template>
    </UCard>
  </UContainer>
</template>
