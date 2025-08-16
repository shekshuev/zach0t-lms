<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps<{
  id: string;
}>();

const loading = ref(true);
const src = ref("");
const error = ref(false);
const showPreview = ref(false);

onMounted(async () => {
  try {
    const res = await fetch(`/api/images/${props.id}`);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    src.value = URL.createObjectURL(blob);
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="w-full lg:min-h-64 lg:w-2/3 lg:min-w-64 lg:mx-auto rounded relative">
    <div v-if="loading" class="w-full h-full animate-pulse bg-gray-200 dark:bg-zinc-700 rounded" />

    <div
      v-else-if="error"
      class="absolute inset-0 flex items-center justify-center text-sm text-red-500 font-medium text-center px-4"
    >
      {{ $t("errors.failed-to-load-image") }}
    </div>

    <img
      v-else
      :src="src"
      alt="Image"
      class="w-full h-full object-contain rounded cursor-pointer"
      @click="showPreview = true"
    />

    <teleport to="body">
      <div
        v-if="showPreview"
        class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        @click.self="showPreview = false"
      >
        <img :src="src" alt="Preview" class="max-w-full max-h-full object-contain rounded shadow-lg" />
        <button class="absolute top-4 right-4 text-white text-2xl" @click="showPreview = false">&times;</button>
      </div>
    </teleport>
  </div>
</template>
