<script setup lang="ts">
import type { JSONContent } from "@tiptap/core";
import Code from "@tiptap/extension-code";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import { Mathematics } from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize, LineHeight, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { onBeforeUnmount } from "vue";

const props = defineProps<{
  content: JSONContent;
}>();

const editor = useEditor({
  editable: false,
  content: props.content,
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Color,
    TextStyle,
    LineHeight,
    FontSize,
    Code,
    Underline,
    Link.configure({ openOnClick: false }),
    TableKit.configure(),
    Mathematics.configure({
      katexOptions: {
        throwOnError: false,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
        },
      },
    }),
  ],
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<template>
  <ClientOnly>
    <EditorContent
      v-if="editor"
      :editor="editor"
      class="prose dark:prose-invert lg:prose-xl max-w-none outline-none border-none focus:outline-none focus:border-none"
    />
  </ClientOnly>
</template>
