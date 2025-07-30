<script setup lang="ts">
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { onBeforeUnmount } from "vue";
import TipTapBubbleMenu from "./TipTapBubbleMenu.vue";

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

onMounted(() => {
  editor.value?.chain().focus().run();
});
</script>

<template>
  <ClientOnly>
    <TipTapBubbleMenu :editor="editor" />
    <EditorContent
      v-if="editor"
      :editor="editor"
      class="prose dark:prose-invert lg:prose-xl max-w-none outline-none border-none focus:outline-none focus:border-none"
    />
  </ClientOnly>
</template>
