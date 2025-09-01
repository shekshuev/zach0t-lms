<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
const { user } = useUserSession();
const role = computed(() => (user.value as SessionPayload).role);
</script>

<template>
  <template v-if="role === 'student'">
    <FeaturesStudentClassQuiz />
  </template>
  <template v-else-if="role === 'teacher'">
    <FeaturesStudentClassQuiz />
  </template>
</template>
