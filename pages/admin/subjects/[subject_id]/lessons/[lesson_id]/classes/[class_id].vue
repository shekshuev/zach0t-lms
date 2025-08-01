<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import { z } from "zod";
import DateTimePicker from "~/components/ui/DateTimePicker.vue";
import type { CreateClassDto, ReadClassDto, UpdateClassDto } from "~/types/class";
import { CLASS_STATUSES } from "~/types/class";

definePageMeta({ layout: "dashboard" });

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const toast = useToast();

const lessonId = computed(() => route.params.lesson_id as string);
const subjectId = computed(() => route.params.subject_id as string);
const classId = computed(() => route.params.class_id as string);
const isNew = computed(() => route.params.class_id === "new");

const schema = z.object({
  beginAt: z.date({ message: t("validations.class-begin-at.valid-date") }),
  group: z
    .string()
    .min(GROUP_MIN_LENGTH, { message: t("validations.group.min", { length: GROUP_MIN_LENGTH }) })
    .max(GROUP_MAX_LENGTH, { message: t("validations.group.max", { length: GROUP_MAX_LENGTH }) }),
  title: z
    .string({ message: t("validations.class-title.required") })
    .min(CLASS_TITLE_MIN_LENGTH, t("validations.class-title.min", { length: CLASS_TITLE_MIN_LENGTH }))
    .max(CLASS_TITLE_MAX_LENGTH, t("validations.class-title.max", { length: CLASS_TITLE_MAX_LENGTH })),
  shortTitle: z
    .string({ message: t("validations.class-short-title.required") })
    .min(CLASS_SHORT_TITLE_MIN_LENGTH, t("validations.class-short-title.min", { length: CLASS_SHORT_TITLE_MIN_LENGTH }))
    .max(
      CLASS_SHORT_TITLE_MAX_LENGTH,
      t("validations.class-short-title.max", { length: CLASS_SHORT_TITLE_MAX_LENGTH }),
    ),
  status: z.enum(CLASS_STATUSES, {
    message: t("validations.class-status.includes", { values: CLASS_STATUSES.join(", ") }),
  }),
});

const state = reactive<CreateClassDto | UpdateClassDto>({
  beginAt: undefined,
  group: "",
  lessonId: lessonId.value,
  shortTitle: "",
  status: "opened",
  title: "",
});

const { data, refresh } = await useAsyncData(
  `admin-class-${classId.value}`,
  () => $fetch<ReadClassDto>(`/api/classes/${classId.value}`),
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

async function onSubmit(e: FormSubmitEvent<CreateClassDto | UpdateClassDto>) {
  try {
    if (isNew.value) {
      const result = await $fetch("/api/classes", {
        method: "POST",
        body: {
          ...e.data,
          lessonId: lessonId.value,
        },
      });
      router.replace(`/admin/subjects/${subjectId.value}/lessons/${lessonId.value}/classes/${result.id}`);
      toast.add({ title: t("pages.admin.classes.class-created") });
    } else {
      await $fetch(`/api/classes/${classId.value}`, {
        method: "PUT",
        body: {
          ...e.data,
          lessonId: lessonId.value,
        },
      });
      toast.add({ title: t("pages.admin.classes.class-updated") });
    }
  } catch (err) {
    const msg = (err as FetchError)?.data?.message || "unknown_error";
    toast.add({ title: t(`errors.${msg}`), color: "error" });
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="container mx-auto py-8" @submit="onSubmit">
    <UCard class="max-w-xl w-full space-y-4 mx-auto">
      <template #header>
        <h2 class="text-2xl font-bold text-center">
          {{ isNew ? $t("pages.admin.classes.create-class") : $t("pages.admin.classes.edit-class") }}
        </h2>
      </template>

      <div class="grid gap-4">
        <UFormField :label="$t('pages.admin.classes.title')" name="title">
          <UInput v-model.trim="state.title" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.short-title')" name="shortTitle">
          <UInput v-model.trim="state.shortTitle" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.group')" name="group">
          <UInput v-model.trim="state.group" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.begin-at')" name="beginAt">
          <DateTimePicker v-model="state.beginAt" class="w-full" />
        </UFormField>

        <UFormField :label="$t('pages.admin.classes.status')" name="status">
          <USelect v-model="state.status" :items="CLASS_STATUSES as unknown as string[]" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex flex-col gap-2 items-center">
          <UButton type="submit" block>
            {{ $t("actions.save") }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UForm>
</template>
