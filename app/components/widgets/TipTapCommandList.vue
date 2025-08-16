<script setup lang="ts">
const props = defineProps<{
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
}>();

const selected = ref(0);

const itemsRef = ref<HTMLElement[]>([]);

defineExpose({ onKeyDown });

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "ArrowDown") {
    selected.value = (selected.value + 1) % props.items.length;
    e.preventDefault();
    return true;
  } else if (e.key === "ArrowUp") {
    selected.value = (selected.value + props.items.length - 1) % props.items.length;
    e.preventDefault();
    return true;
  } else if (e.key === "Enter") {
    props.command(props.items[selected.value] as SuggestionItem);
    e.preventDefault();
    return true;
  } else if (e.key === "Escape") {
    e.preventDefault();
    return true;
  }
  return false;
}

watch(
  () => props.items,
  () => {
    selected.value = 0;
  },
);

watch(selected, async newIndex => {
  await nextTick();
  const el = itemsRef.value[newIndex];
  if (el) {
    el.scrollIntoView({ block: "nearest" });
  }
});
</script>

<template>
  <div
    class="w-72 max-h-80 overflow-auto rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-md p-1"
  >
    <div
      v-for="(item, idx) in items"
      :key="item.name"
      ref="itemsRef"
      class="flex gap-2 items-start px-2 py-2 rounded cursor-pointer"
      :class="idx === selected ? 'bg-zinc-100 dark:bg-zinc-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/60'"
      @mousedown.prevent="props.command(item)"
    >
      <UIcon :name="item.icon" class="mt-0.5" />
      <div class="flex flex-col">
        <span class="text-sm font-medium">{{ $t(`widgets.tiptap.${item.name}`) }}</span>
      </div>
    </div>
    <div v-if="!items.length" class="px-3 py-2 text-sm text-zinc-500">{{ $t("errors.no-results") }}</div>
  </div>
</template>
