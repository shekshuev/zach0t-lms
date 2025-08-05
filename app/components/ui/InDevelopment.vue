<script setup lang="ts">
import Development from "~/assets/svg/development.svg";
</script>

<template>
  <div class="h-full w-full flex flex-col gap-8 justify-center items-center">
    <Development class="w-full sm:w-80" />
    <h3 class="text-2xl">{{ $t("ui.in-development.header") }}</h3>
  </div>
</template>
