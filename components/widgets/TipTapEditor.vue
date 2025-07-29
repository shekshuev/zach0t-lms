<script setup lang="ts">
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { onBeforeUnmount } from "vue";

const props = defineProps<{
  modelValue: JSONContent;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: JSONContent): void;
}>();

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  onUpdate: useDebounceFn(({ editor }) => {
    emit("update:modelValue", editor.getJSON());
  }, 500),
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <ClientOnly>
    <EditorContent v-if="editor" :editor="editor" />
  </ClientOnly>
</template>
