<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Item {
  title: string;
  subtitle?: string;
  icon?: string;
  command: () => void;
}

const props = defineProps<{
  items: Item[];
  command: (item: Item) => void;
}>();

const selected = ref(0);

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    selected.value = (selected.value + 1) % props.items.length;
    e.preventDefault();
  } else if (e.key === "ArrowUp") {
    selected.value = (selected.value + props.items.length - 1) % props.items.length;
    e.preventDefault();
  } else if (e.key === "Enter") {
    props.command(props.items[selected.value]);
    e.preventDefault();
  } else if (e.key === "Escape") {
    //
  }
}

onMounted(() => document.addEventListener("keydown", onKeyDown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeyDown));

watch(
  () => props.items,
  () => {
    selected.value = 0;
  },
);
</script>

<template>
  <div
    class="w-72 max-h-80 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-md p-1"
  >
    <div
      v-for="(item, idx) in items"
      :key="item.title"
      class="flex gap-2 items-start px-2 py-2 rounded cursor-pointer"
      :class="idx === selected ? 'bg-zinc-100 dark:bg-zinc-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/60'"
      @mousedown.prevent="props.command(item)"
    >
      <i :class="item.icon || 'i-lucide-command'" class="mt-0.5" />
      <div class="flex flex-col">
        <span class="text-sm font-medium">{{ item.title }}</span>
        <span v-if="item.subtitle" class="text-xs text-zinc-500">{{ item.subtitle }}</span>
      </div>
    </div>
    <div v-if="!items.length" class="px-3 py-2 text-sm text-zinc-500">No results</div>
  </div>
</template>
