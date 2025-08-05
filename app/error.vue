<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const { t } = useI18n();

const existingError = computed(() => props.error && [400, 401, 403, 404, 500, 503].includes(props.error.statusCode));

const component = computed(() => {
  if (existingError) {
    return defineAsyncComponent(() => import(`~/assets/svg/${props.error!.statusCode}.svg`));
  } else {
    return defineAsyncComponent(() => import(`~/assets/svg/unknown-error.svg`));
  }
});

const message = computed(() => {
  if (existingError) {
    return t(`errors.${props.error!.statusCode}`);
  } else {
    return t("errors.unknown");
  }
});
</script>

<template>
  <div class="w-screen h-screen min-h-screen overflow-hidden flex flex-col gap-8 items-center justify-center">
    <component :is="component" class="w-full sm:w-80" />
    <h3 class="text-2xl">{{ message }}</h3>
    <NuxtLink to="/">{{ t("actions.go-home") }}</NuxtLink>
  </div>
</template>
