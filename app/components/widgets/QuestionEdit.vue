<script setup lang="ts">
interface Props {
  question: QuizQuestion;
}

const { question } = defineProps<Props>();
</script>

<template>
  <UCard>
    <template #footer>
      <h2 class="text-xl font-bold">
        {{ question.id }}
      </h2>
    </template>
  </UCard>
</template>
