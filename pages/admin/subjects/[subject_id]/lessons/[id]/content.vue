<script setup lang="ts">
import type { JSONContent } from "@tiptap/vue-3";
import TipTapEditor from "~/components/widgets/TipTapEditor.vue";
import type { ReadFullLessonDto } from "~/types/lesson";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();

const id = computed(() => route.params.id as string);

const { data } = await useAsyncData(`admin-lesson-${id.value}`, () =>
  $fetch<ReadFullLessonDto>(`/api/lessons/${id.value}`),
);

const autosave = useDebounceFn(async payload => {
  await $fetch(`/api/lessons/${id.value}`, {
    method: "PUT",
    body: {
      ...data.value,
      content: payload,
    },
  });
}, 2000);

const content = ref<JSONContent>({
  type: "doc",
  content: [],
});

watchEffect(() => {
  if (data.value) {
    content.value = data.value.content;
  }
});

watch(content, autosave);
</script>

<template>
  <div class="container mx-auto py-8">
    <TipTapEditor v-if="content" v-model="content" />
  </div>
</template>
