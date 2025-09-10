<script setup lang="ts">
import type { JSONContent } from "@tiptap/vue-3";

const route = useRoute();

const classId = computed(() => route.params.class_id);

const { data: cls, error } = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId.value}`);
});

const state = ref<"saved" | "not-saved" | "saving">("saved");

const autosave = useDebounceFn(async payload => {
  try {
    state.value = "saving";
    await $fetch(`/api/classes/${classId.value}`, {
      method: "PUT",
      body: {
        ...cls.value,
        lessonId: cls.value?.lesson.id,
        lesson: {
          ...cls.value?.lesson,
          content: payload,
        },
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

watch(content, newValue => {
  state.value = "not-saved";
  cls.value!.lesson.content = newValue;
  autosave(newValue);
});

watchEffect(() => {
  if (cls.value) {
    content.value = cls.value.lesson.content;
  }
});

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});
</script>

<template>
  <WidgetsTipTapEditor v-if="cls" v-model="content" :state="state" />
  <UButton color="neutral" icon="i-lucide-arrow-left" @click="$router.back()"> {{ $t("actions.go-back") }} </UButton>
</template>
