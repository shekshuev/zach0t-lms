<script setup lang="ts">
import Maintenance from "~/assets/svg/maintenance.svg";
</script>

<template>
  <div class="h-full w-full flex flex-col gap-8 justify-center items-center">
    <Maintenance class="w-1/3" />
    <h3 class="text-2xl">{{ $t("ui.in-development.header") }}</h3>
  </div>
</template>
