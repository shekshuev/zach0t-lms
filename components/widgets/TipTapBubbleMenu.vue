<script setup lang="ts">
import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import type { Editor } from "@tiptap/vue-3";
import { BubbleMenu } from "@tiptap/vue-3/menus";

interface Action {
  name: string;
  label: string;
  icon: string;
  command: () => void;
}

const { t } = useI18n();

const props = defineProps<{
  editor?: Editor;
}>();

const shouldShow = (props: {
  editor: Editor;
  view: EditorView;
  state: EditorState;
  oldState?: EditorState;
  from: number;
  to: number;
}) => {
  const { state, from } = props;
  const { doc, selection } = state;
  const { empty } = selection;

  if (empty) return false;

  return true;
};

const textActions: Action[] = [
  {
    name: "bold",
    label: t("widgets.tiptap.bold"),
    icon: "i-lucide-bold",
    command: () => props.editor?.chain().focus().toggleBold().run(),
  },
  {
    name: "italic",
    label: t("widgets.tiptap.italic"),
    icon: "i-lucide-italic",
    command: () => props.editor?.chain().focus().toggleItalic().run(),
  },
  {
    name: "strike",
    label: t("widgets.tiptap.strikethrough"),
    icon: "i-lucide-strikethrough",
    command: () => props.editor?.chain().focus().toggleStrike().run(),
  },
  {
    name: "bulletList",
    label: t("widgets.tiptap.unordered-list"),
    icon: "i-lucide-list",
    command: () => props.editor?.chain().focus().toggleBulletList().run(),
  },
  {
    name: "orderedList",
    label: t("widgets.tiptap.ordered-list"),
    icon: "i-lucide-list-ordered",
    command: () => props.editor?.chain().focus().toggleOrderedList().run(),
  },
];

const contentTypes: Action[] = [
  {
    name: "paragraph",
    label: t("widgets.tiptap.paragraph"),
    icon: "i-lucide-letter-text",
    command: () => props.editor?.chain().focus().setParagraph().run(),
  },
  {
    name: "heading",
    label: t("widgets.tiptap.heading") + " 1",
    icon: "i-lucide-heading-1",
    command: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    name: "heading",
    label: t("widgets.tiptap.heading") + " 2",
    icon: "i-lucide-heading-2",
    command: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    name: "heading",
    label: t("widgets.tiptap.heading") + " 3",
    icon: "i-lucide-heading-3",
    command: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
  },

  {
    name: "codeBlock",
    label: t("widgets.tiptap.code"),
    icon: "i-lucide-code",
    command: () => props.editor?.chain().focus().toggleCodeBlock().run(),
  },
  {
    name: "blockquote",
    label: t("widgets.tiptap.blockquote"),
    icon: "i-lucide-quote",
    command: () => props.editor?.chain().focus().toggleBlockquote().run(),
  },
];

const currentContentType = computed(() => {
  if (props.editor?.isActive("heading", { level: 1 })) return t("widgets.tiptap.heading") + " 1";
  if (props.editor?.isActive("heading", { level: 2 })) return t("widgets.tiptap.heading") + " 2";
  if (props.editor?.isActive("heading", { level: 3 })) return t("widgets.tiptap.heading") + " 3";
  if (props.editor?.isActive("codeBlock")) return t("widgets.tiptap.code");
  if (props.editor?.isActive("blockquote")) return t("widgets.tiptap.blockquote");
  return t("widgets.tiptap.paragraph");
});

// const colors: Color[] = [
//   { name: "Default", value: "inherit" },
//   { name: "Gray", value: "#6B7280" },
//   { name: "Brown", value: "#92400E" },
//   { name: "Orange", value: "#EA580C" },
//   { name: "Yellow", value: "#CA8A04" },
//   { name: "Green", value: "#16A34A" },
//   { name: "Blue", value: "#2563EB" },
//   { name: "Purple", value: "#9333EA" },
//   { name: "Pink", value: "#DB2777" },
//   { name: "Red", value: "#DC2626" },
// ];

// const setTextColor = (color: string) => {
//   props.editor?.chain().focus().setColor(color).run();
//   showColorMenu.value = false;
// };
</script>

<template>
  <bubble-menu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor" :should-show="shouldShow">
    <div class="flex gap-2 p-2 bg-white rounded-md shadow-sm">
      <UPopover>
        <UButton :label="currentContentType" variant="ghost" />
        <template #content>
          <div class="flex flex-col gap-2 p-2 bg-white mt-2 rounded-md shadow-sm">
            <UButton
              v-for="action in contentTypes"
              :key="action.name"
              variant="ghost"
              :icon="action.icon"
              @click="action.command()"
            >
              {{ action.label }}
            </UButton>
          </div>
        </template>
      </UPopover>
      <UButton
        v-for="action in textActions"
        :key="action.name"
        variant="ghost"
        :icon="action.icon"
        @click="action.command()"
      />
    </div>
  </bubble-menu>
</template>
