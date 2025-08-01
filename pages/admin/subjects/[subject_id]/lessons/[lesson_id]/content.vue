<script setup lang="ts">
import type { JSONContent } from "@tiptap/vue-3";
import TipTapEditor from "~/components/widgets/TipTapEditor.vue";
import type { ReadFullLessonDto } from "~/types/lesson";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const state = ref<"saved" | "not-saved" | "saving">("saved");

const id = computed(() => route.params.lesson_id as string);

const { data } = await useAsyncData(`admin-lesson-${id.value}`, () =>
  $fetch<ReadFullLessonDto>(`/api/lessons/${id.value}`),
);

const autosave = useDebounceFn(async payload => {
  try {
    state.value = "saving";
    await $fetch(`/api/lessons/${id.value}`, {
      method: "PUT",
      body: {
        ...data.value,
        content: payload,
      },
    });
    state.value = "saved";
  } catch {
    state.value = "not-saved";
  }
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

watch(content, newValue => {
  state.value = "not-saved";
  autosave(newValue);
});
</script>

<template>
  <div class="container mx-auto py-8">
    <TipTapEditor v-if="content" v-model="content" :state="state" />
  </div>
</template>
