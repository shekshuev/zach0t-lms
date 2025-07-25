<script setup lang="ts">
import type { ReadUserDto, UserRole } from "~/types/user";
import { USER_ROLES, USER_STATUSES } from "~/types/user";
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

definePageMeta({ layout: "dashboard" });

const route = useRoute();
const router = useRouter();
const toast = useToast();

const isNew = computed(() => route.params.id === "new");
const id = computed(() => route.params.id as string);

const schema = z.object({
  username: z.string().min(3).max(32),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
});

const state = reactive<z.infer<typeof schema>>({
  username: "",
  firstName: "",
  lastName: "",
  role: "user" as UserRole,
  status: "created",
});

const { data, refresh } = await useAsyncData(
  `admin-user-${id.value}`,
  () => $fetch<ReadUserDto>(`/api/users/${id.value}`),
  {
    immediate: false,
  },
);

watchEffect(() => {
  if (!isNew.value) {
    refresh();
  }
});

watch(data, newValue => {
  if (newValue) {
    Object.assign(state, newValue);
  }
});

async function onSubmit(e: FormSubmitEvent<typeof state>) {
  try {
    if (isNew.value) {
      await $fetch("/api/admin/users", {
        method: "POST",
        body: e.data,
      });
    } else {
      await $fetch(`/api/admin/users/${id.value}`, {
        method: "PUT",
        body: e.data,
      });
    }
    toast.add({ title: "Saved successfully" });
    router.push("/admin/users");
  } catch (err) {
    toast.add({
      title: "Error",
      description: err?.data?.message || "Unexpected error",
    });
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UCard class="max-w-xl w-full space-y-4 mx-auto mt-8">
      <template #header>
        <h2 class="text-2xl font-bold text-center">
          {{ isNew ? "Create User" : "Edit User" }}
        </h2>
      </template>

      <div class="grid gap-4">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" class="w-full" />
        </UFormField>

        <UFormField label="First Name" name="firstName">
          <UInput v-model="state.firstName" class="w-full" />
        </UFormField>

        <UFormField label="Last Name" name="lastName">
          <UInput v-model="state.lastName" class="w-full" />
        </UFormField>

        <UFormField label="Role" name="role">
          <USelect v-model="state.role" :items="USER_ROLES as unknown as string[]" class="w-full" />
        </UFormField>

        <UFormField label="Status" name="status">
          <USelect v-model="state.status" :items="USER_STATUSES as unknown as string[]" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <UButton type="submit" block>
          {{ isNew ? "Create" : "Save Changes" }}
        </UButton>
      </template>
    </UCard>
  </UForm>
</template>
