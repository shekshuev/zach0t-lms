<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { BubbleMenu } from "@tiptap/vue-3/menus";

interface Action {
  name: string;
  label: string;
  icon?: string;
  command: () => void;
  isActive: () => boolean;
}

const { t } = useI18n();

const props = defineProps<{
  editor?: Editor;
}>();

const textActions = computed<Action[]>(() => [
  {
    name: "bold",
    label: t("widgets.tiptap.bold"),
    icon: "i-lucide-bold",
    command: () => props.editor?.chain().focus().toggleBold().run(),
    isActive: () => props.editor?.isActive("bold") || false,
  },
  {
    name: "italic",
    label: t("widgets.tiptap.italic"),
    icon: "i-lucide-italic",
    command: () => props.editor?.chain().focus().toggleItalic().run(),
    isActive: () => props.editor?.isActive("italic") || false,
  },
  {
    name: "strike",
    label: t("widgets.tiptap.strikethrough"),
    icon: "i-lucide-strikethrough",
    command: () => props.editor?.chain().focus().toggleStrike().run(),
    isActive: () => props.editor?.isActive("strike") || false,
  },
  {
    name: "underline",
    label: t("widgets.tiptap.underline"),
    icon: "i-lucide-underline",
    command: () => props.editor?.chain().focus().toggleUnderline().run(),
    isActive: () => props.editor?.isActive("underline") || false,
  },
  {
    name: "bulletList",
    label: t("widgets.tiptap.unordered-list"),
    icon: "i-lucide-list",
    command: () => props.editor?.chain().focus().toggleBulletList().run(),
    isActive: () => false,
  },
  {
    name: "orderedList",
    label: t("widgets.tiptap.ordered-list"),
    icon: "i-lucide-list-ordered",
    command: () => props.editor?.chain().focus().toggleOrderedList().run(),
    isActive: () => false,
  },
  {
    name: "alignLeft",
    label: t("widgets.tiptap.align.left"),
    icon: "i-lucide-align-left",
    command: () => props.editor?.chain().focus().setTextAlign("left").run(),
    isActive: () => props.editor?.isActive({ textAlign: "left" }) || false,
  },
  {
    name: "alignCenter",
    label: t("widgets.tiptap.align.center"),
    icon: "i-lucide-align-center",
    command: () => props.editor?.chain().focus().setTextAlign("center").run(),
    isActive: () => props.editor?.isActive({ textAlign: "center" }) || false,
  },
  {
    name: "alignRight",
    label: t("widgets.tiptap.align.right"),
    icon: "i-lucide-align-right",
    command: () => props.editor?.chain().focus().setTextAlign("right").run(),
    isActive: () => props.editor?.isActive({ textAlign: "right" }) || false,
  },
  {
    name: "alignJustify",
    label: t("widgets.tiptap.align.justify"),
    icon: "i-lucide-align-justify",
    command: () => props.editor?.chain().focus().setTextAlign("justify").run(),
    isActive: () => props.editor?.isActive({ textAlign: "justify" }) || false,
  },
  {
    name: "math",
    label: t("widgets.tiptap.math"),
    icon: "i-lucide-sigma",
    command: () => props.editor?.chain().focus().setTextAlign("justify").run(),
    isActive: () => props.editor?.isActive({ textAlign: "justify" }) || false,
  },
  {
    name: "code",
    label: t("widgets.tiptap.code"),
    icon: "i-lucide-braces",
    command: () => props.editor?.chain().focus().toggleCode().run(),
    isActive: () => props.editor?.isActive("code") || false,
  },
  {
    name: "undo",
    label: t("widgets.tiptap.undo"),
    icon: "i-lucide-undo",
    command: () => props.editor?.chain().focus().undo().run(),
    isActive: () => false,
  },
  {
    name: "redo",
    label: t("widgets.tiptap.redo"),
    icon: "i-lucide-redo",
    command: () => props.editor?.chain().focus().redo().run(),
    isActive: () => false,
  },
  {
    name: "link",
    label: t("widgets.tiptap.link"),
    icon: "i-lucide-link",
    command: () => {
      const url = prompt("Enter URL");
      if (url) props.editor?.chain().focus().setLink({ href: url }).run();
    },
    isActive: () => props.editor?.isActive("link") || false,
  },
]);

const contentTypes = computed<Action[]>(() => [
  {
    name: "paragraph",
    label: t("widgets.tiptap.paragraph"),
    icon: "i-lucide-letter-text",
    command: () => props.editor?.chain().focus().setParagraph().run(),
    isActive: () => false,
  },
  {
    name: "heading",
    label: t("widgets.tiptap.heading-1"),
    icon: "i-lucide-heading-1",
    command: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => false,
  },
  {
    name: "heading",
    label: t("widgets.tiptap.heading-2"),
    icon: "i-lucide-heading-2",
    command: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => false,
  },
  {
    name: "heading",
    label: t("widgets.tiptap.heading-3"),
    icon: "i-lucide-heading-3",
    command: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => false,
  },
  {
    name: "codeBlock",
    label: t("widgets.tiptap.code-block"),
    icon: "i-lucide-code",
    command: () => props.editor?.chain().focus().toggleCodeBlock().run(),
    isActive: () => false,
  },
  {
    name: "blockquote",
    label: t("widgets.tiptap.blockquote"),
    icon: "i-lucide-quote",
    command: () => props.editor?.chain().focus().toggleBlockquote().run(),
    isActive: () => false,
  },
]);

const currentContentType = computed(() => {
  if (props.editor?.isActive("heading", { level: 1 })) return t("widgets.tiptap.heading-1");
  if (props.editor?.isActive("heading", { level: 2 })) return t("widgets.tiptap.heading-2");
  if (props.editor?.isActive("heading", { level: 3 })) return t("widgets.tiptap.heading-3");
  if (props.editor?.isActive("codeBlock")) return t("widgets.tiptap.code");
  if (props.editor?.isActive("blockquote")) return t("widgets.tiptap.blockquote");
  return t("widgets.tiptap.paragraph");
});

const colors = computed(() => [
  { name: t("widgets.tiptap.colors.gray"), value: "#6B7280" },
  { name: t("widgets.tiptap.colors.brown"), value: "#92400E" },
  { name: t("widgets.tiptap.colors.orange"), value: "#EA580C" },
  { name: t("widgets.tiptap.colors.yellow"), value: "#CA8A04" },
  { name: t("widgets.tiptap.colors.green"), value: "#16A34A" },
  { name: t("widgets.tiptap.colors.blue"), value: "#2563EB" },
  { name: t("widgets.tiptap.colors.purple"), value: "#9333EA" },
  { name: t("widgets.tiptap.colors.pink"), value: "#DB2777" },
  { name: t("widgets.tiptap.colors.red"), value: "#DC2626" },
]);

const setTextColor = (color: string) => {
  props.editor?.chain().focus().setColor(color).run();
};
const clearTextColor = () => {
  props.editor?.chain().focus().unsetColor().run();
};

const lineHeights = computed<Action[]>(() => [
  ...["1.0", "1.5", "2.0", "2.5", "3.0"].map(value => ({
    name: value,
    label: value,
    command: () => props.editor?.chain().focus().toggleTextStyle({ lineHeight: value }).run(),
    isActive: () => props.editor?.isActive({ lineHeight: value }) || false,
  })),
  {
    name: "unset",
    label: t("widgets.tiptap.unset-line-height"),
    command: () => props.editor?.chain().focus().unsetLineHeight().run(),
    isActive: () => false,
  },
]);

const fontSizes = computed<Action[]>(() => [
  ...["14", "18", "20", "24", "28", "32", "36", "48", "64"].map(size => ({
    name: size,
    label: size,
    command: () => props.editor?.chain().focus().setFontSize(`${size}px`).run(),
    isActive: () => props.editor?.isActive("textStyle", { fontSize: `${size}px` }) || false,
  })),
  {
    name: "unset",
    label: t("widgets.tiptap.unset-font-size"),
    command: () => props.editor?.chain().focus().unsetFontSize().run(),
    isActive: () => false,
  },
]);

const tableActions = computed<Action[]>(() => [
  {
    name: "insertTable",
    label: t("widgets.tiptap.insert-table"),
    icon: "i-lucide-table",
    command: () => props.editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    isActive: () => false,
  },
  {
    name: "deleteTable",
    label: t("widgets.tiptap.delete-table"),
    icon: "i-lucide-trash",
    command: () => props.editor?.chain().focus().deleteTable().run(),
    isActive: () => false,
  },
  {
    name: "addRowAfter",
    label: t("widgets.tiptap.add-row"),
    icon: "i-lucide-plus",
    command: () => props.editor?.chain().focus().addRowAfter().run(),
    isActive: () => false,
  },
  {
    name: "addColumnAfter",
    label: t("widgets.tiptap.add-column"),
    icon: "i-lucide-plus-square",
    command: () => props.editor?.chain().focus().addColumnAfter().run(),
    isActive: () => false,
  },
  {
    name: "deleteRow",
    label: t("widgets.tiptap.delete-row"),
    icon: "i-lucide-minus",
    command: () => props.editor?.chain().focus().deleteRow().run(),
    isActive: () => false,
  },
  {
    name: "deleteColumn",
    label: t("widgets.tiptap.delete-column"),
    icon: "i-lucide-minus-square",
    command: () => props.editor?.chain().focus().deleteColumn().run(),
    isActive: () => false,
  },
]);
</script>

<template>
  <bubble-menu
    v-if="editor"
    :editor="editor"
    :tippy-options="{ duration: 100 }"
    :should-show="props => !props.state.selection.empty"
  >
    <div class="flex gap-2 p-2 max-w-screen flex-wrap bg-zinc-100 dark:bg-zinc-800 rounded-md shadow-sm border-none">
      <UPopover>
        <UButton :label="currentContentType" variant="ghost" />
        <template #content>
          <div class="flex flex-col gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 mt-2 rounded-md shadow-none">
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
      <UPopover>
        <UTooltip :text="t('widgets.tiptap.line-height')">
          <UButton icon="i-lucide-move-vertical" variant="ghost" />
        </UTooltip>
        <template #content>
          <div class="flex flex-col gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 mt-2 rounded-md shadow-none">
            <UButton
              v-for="action in lineHeights"
              :key="action.name"
              :variant="action.isActive() ? 'soft' : 'ghost'"
              :icon="action.icon"
              @click="action.command()"
            >
              {{ action.label }}
            </UButton>
          </div>
        </template>
      </UPopover>
      <UPopover>
        <UTooltip :text="t('widgets.tiptap.font-size')">
          <UButton icon="i-lucide-a-large-small" variant="ghost" />
        </UTooltip>
        <template #content>
          <div class="flex flex-col gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 mt-2 rounded-md shadow-none">
            <UButton
              v-for="action in fontSizes"
              :key="action.name"
              :variant="action.isActive() ? 'soft' : 'ghost'"
              :icon="action.icon"
              @click="action.command()"
            >
              {{ action.label }}
            </UButton>
          </div>
        </template>
      </UPopover>
      <UPopover>
        <UTooltip :text="t('widgets.tiptap.table')">
          <UButton icon="i-lucide-table-properties" variant="ghost" />
        </UTooltip>
        <template #content>
          <div class="flex flex-col gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 mt-2 rounded-md shadow-none">
            <UButton
              v-for="action in tableActions"
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
      <UTooltip v-for="action in textActions" :key="action.name" :text="action.label" :popper="{ placement: 'top' }">
        <UButton :variant="action.isActive() ? 'soft' : 'ghost'" :icon="action.icon" @click="action.command()" />
      </UTooltip>

      <UPopover>
        <UTooltip :text="t('widgets.tiptap.colors.header')">
          <UButton icon="i-lucide-palette" variant="ghost" />
        </UTooltip>
        <template #content>
          <div class="grid grid-cols-5 gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 mt-2 rounded-md shadow-sm">
            <UTooltip v-for="color in colors" :key="color.value" :text="color.name" :popper="{ placement: 'top' }">
              <button
                class="w-6 h-6 rounded-full border-2"
                :class="{
                  'border-primary': props.editor?.getAttributes('textStyle')?.color === color.value,
                  'border-zinc-300 dark:border-zinc-600':
                    props.editor?.getAttributes('textStyle')?.color !== color.value,
                }"
                :style="{ backgroundColor: color.value }"
                @click="setTextColor(color.value)"
              />
            </UTooltip>

            <UTooltip :text="t('widgets.tiptap.colors.reset')" :popper="{ placement: 'top' }">
              <button
                class="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center"
                @click="clearTextColor"
              >
                <span class="w-3 h-3 bg-white rounded-full border border-zinc-400" />
              </button>
            </UTooltip>
          </div>
        </template>
      </UPopover>
    </div>
  </bubble-menu>
</template>
