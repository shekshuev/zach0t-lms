<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

const route = useRoute();

const classId = computed(() => route.params.class_id);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId.value}`);
});

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});
</script>

<template>
  <UContainer class="max-w-4xl py-8">
    <WidgetsTipTapViewer v-if="cls" :content="cls.lesson.content" />
    <UButton color="neutral" icon="i-lucide-arrow-left" @click="$router.back()"> {{ $t("actions.go-back") }} </UButton>
  </UContainer>
</template>
