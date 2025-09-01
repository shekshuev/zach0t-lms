<script setup lang="ts">
const route = useRoute();
const classId = computed(() => route.params.class_id as string);

definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <FeaturesClass :class-id="classId" />
</template>
