<script setup lang="ts">
const { user } = useUserSession();

watchEffect(() => {
  if (user.value) {
    navigateTo("/");
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <slot />
  </div>
</template>
