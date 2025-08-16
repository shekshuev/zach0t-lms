<script setup lang="ts">
import { ImageComponent } from "@/extensions/image";
import SlashCommands from "@/extensions/slash-commands";
import type { JSONContent } from "@tiptap/core";
import Code from "@tiptap/extension-code";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import { Mathematics } from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize, LineHeight, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { CharacterCount, Placeholder, TrailingNode } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { onBeforeUnmount } from "vue";

const LIMIT = 50000;

const { t } = useI18n();

const props = defineProps<{
  modelValue: JSONContent;
  state: "saved" | "saving" | "not-saved";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: JSONContent): void;
}>();

const editor = useEditor({
  content: props.modelValue,
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
    CharacterCount.configure({
      limit: LIMIT,
    }),
    Link.configure({ openOnClick: false }),
    TableKit.configure({
      table: {
        resizable: true,
      },
    }),
    Mathematics.configure({
      inlineOptions: {
        onClick: (node, pos) => {
          const katex = prompt("Enter new calculation:", node.attrs.latex);
          if (katex) {
            editor.value?.chain().setNodeSelection(pos).updateInlineMath({ latex: katex }).focus().run();
          }
        },
      },

      blockOptions: {
        onClick: (node, pos) => {
          const katex = prompt("Enter new calculation:", node.attrs.latex);
          if (katex) {
            editor.value?.chain().setNodeSelection(pos).updateBlockMath({ latex: katex }).focus().run();
          }
        },
      },

      katexOptions: {
        throwOnError: false,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
        },
      },
    }),
    Placeholder.configure({
      placeholder: t("widgets.tiptap.placeholder"),
    }),
    TrailingNode,
    SlashCommands,
    ImageComponent,
  ],
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
    <WidgetsTipTapBubbleMenu :editor="editor" />
    <div class="flex justify-end items-center gap-2">
      <UBadge :color="editor?.storage.characterCount.characters() === LIMIT ? 'error' : 'primary'">{{
        $t("widgets.tiptap.characters", { count: editor?.storage.characterCount.characters(), total: LIMIT })
      }}</UBadge>
      <UBadge>{{ $t("widgets.tiptap.words", { count: editor?.storage.characterCount.words() }) }}</UBadge>
      <UBadge :color="props.state === 'not-saved' ? 'error' : props.state === 'saving' ? 'warning' : 'primary'">{{
        $t(`widgets.tiptap.${props.state}`)
      }}</UBadge>
    </div>
    <EditorContent
      v-if="editor"
      :editor="editor"
      class="prose dark:prose-invert lg:prose-xl max-w-none outline-none border-none focus:outline-none focus:border-none"
    />
  </ClientOnly>
</template>
