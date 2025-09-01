<script setup lang="ts">
import redCard from "@/assets/img/red-card.webp";
import yellowCard from "@/assets/img/yello-card.jpg";
import CompletedSvg from "@/assets/svg/completed.svg";
import TimeSvg from "@/assets/svg/time.svg";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import { z } from "zod";

const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const classId = computed(() => route.params.class_id as string);
const quizId = computed(() => route.params.quiz_id as string);

const banModalOpen = ref(false);
const finalBanModalOpen = ref(false);
const quizStatus = ref();

const {
  data: cls,
  error,
  status,
  refresh,
} = await useAsyncData(`class-${classId.value}`, () => {
  return $fetch<ReadFullClassDto>(`/api/schedule/${classId.value}`);
});

onBeforeRouteLeave(() => {
  refresh();
});

const schema = z.object({
  questionId: z.string().uuid(),
  options: z.array(z.string()).min(1, { message: t("validations.quiz-answers.min", { length: 1 }) }),
});

const state = reactive<CreateQuizResultAnswerDto>({
  questionId: "",
  options: [],
});

watchEffect(() => {
  if (error.value) {
    showError({ statusCode: error.value.statusCode });
  }
});

const quiz = computed(() => cls.value?.lesson?.quizzes?.find?.(q => q.id === quizId.value));
const quizResult = computed(() => cls.value?.quizResults?.find?.(qr => qr.quizId === quizId.value));

const currentQuestionIndex = ref(0);
const currentQuestion = computed(() => quiz.value?.questions[currentQuestionIndex.value]);

watchEffect(() => {
  if (quizStatus.value === "banned" && !finalBanModalOpen.value) {
    showError({ statusCode: 403 });
  }
});

watchEffect(() => {
  if (quizResult.value) {
    currentQuestionIndex.value = quizResult.value.nextQuestionIndex;
    if (quizResult.value.deadlineAt && new Date(quizResult.value.deadlineAt).getTime() - Date.now() <= 0) {
      quizStatus.value = "timeout";
    } else {
      quizStatus.value = quizResult.value.status;
    }
  }
});

watchEffect(() => {
  if (currentQuestion.value) {
    state.questionId = currentQuestion.value.id;
    state.options = [];
  }
});

const timer = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

watchEffect(onCleanup => {
  const result = quizResult.value;
  if (!result || !result.deadlineAt) return;

  const deadline = new Date(result.deadlineAt).getTime();

  const update = () => {
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
    timer.value = remaining;
    if (remaining === 0 && quizStatus.value !== "timeout") {
      quizStatus.value = "timeout";
    }
  };

  update();
  timerInterval = setInterval(update, 1000);

  onCleanup(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
});

useCheaterDetector(async () => {
  if (
    finalBanModalOpen.value ||
    banModalOpen.value ||
    (quiz.value?.maxCheatAttempts && quiz.value?.maxCheatAttempts <= 0)
  )
    return;
  try {
    const { status } = await $fetch<ReadStudentQuizResultDto>(
      `/api/schedule/${classId.value}/quiz/${quizId.value}/cheat`,
      {
        method: "POST",
      },
    );

    if (status === "banned") {
      finalBanModalOpen.value = true;
      quizStatus.value = status;
    } else {
      banModalOpen.value = true;
    }
  } catch (err) {
    const msg = (err as FetchError)?.data?.message || "unknown";
    console.error(`Can't ban user: ${t(`errors.${msg}`)}`);
  }
});

const loading = ref(false);

async function onSubmit(e: FormSubmitEvent<CreateQuizResultAnswerDto>) {
  try {
    loading.value = true;
    const { nextQuestionIndex, status } = await $fetch<ReadStudentQuizResultDto>(
      `/api/schedule/${classId.value}/quiz/${quizId.value}`,
      {
        method: "POST",
        body: e.data,
      },
    );
    currentQuestionIndex.value = nextQuestionIndex;
    quizStatus.value = status;
  } catch (err) {
    const msg = (err as FetchError)?.data?.message || "unknown";
    toast.add({ title: t(`errors.${msg}`), color: "error" });
  } finally {
    loading.value = false;
  }
}

const handleCheckboxChange = (optionId: string, isChecked: boolean) => {
  if (isChecked) {
    if (!state.options.includes(optionId)) {
      state.options.push(optionId);
    }
  } else {
    const index = state.options.indexOf(optionId);
    if (index > -1) {
      state.options.splice(index, 1);
    }
  }
};
</script>

<template>
  <UCard v-if="quizStatus === 'finished'">
    <div class="flex flex-col gap-8 items-center justify-center">
      <CompletedSvg class="w-full sm:w-80" />

      <p class="text-center text-xl font-bold">{{ $t("features.dashboard.schedule.quizzes.finished") }}</p>

      <UButton color="neutral" variant="ghost" @click="$router.back()">{{ $t("actions.go-back") }}</UButton>
    </div>
  </UCard>
  <UCard v-else-if="quizStatus === 'timeout'">
    <div class="flex flex-col gap-8 items-center justify-center">
      <TimeSvg class="w-full sm:w-80" />

      <p class="text-center text-xl font-bold">{{ $t("features.dashboard.schedule.quizzes.finished") }}</p>

      <UButton color="neutral" variant="ghost" @click="$router.back()">{{ $t("actions.go-back") }}</UButton>
    </div>
  </UCard>
  <UForm v-else :schema="schema" :state="state as any" class="flex flex-col gap-8" @submit="onSubmit">
    <UCard v-if="currentQuestion" class="space-y-4">
      <template #header>
        <p class="text-sm text-gray-500 text-right">
          {{ $t("features.dashboard.schedule.quizzes.time-left") }}:
          {{
            Math.floor(timer / 60)
              .toString()
              .padStart(2, "0")
          }}:{{ (timer % 60).toString().padStart(2, "0") }}
        </p>
      </template>

      <USkeleton class="h-24 w-full" v-if="status === 'pending'" />
      <WidgetsTipTapViewer v-else :content="currentQuestion.prompt" />

      <template v-if="status === 'pending'">
        <div class="grid grid-cols-[1fr_20px] gap-4 items-center">
          <USkeleton class="h-6" />
          <USkeleton class="h-6" />
          <USkeleton class="h-6" />
          <USkeleton class="h-6" />
          <USkeleton class="h-6" />
          <USkeleton class="h-6" />
        </div>
      </template>

      <template v-else-if="currentQuestion.type === 'open'">
        <UFormField :label="$t('features.dashboard.schedule.quizzes.options')" name="options">
          <UTextarea v-model="state.options[0]" class="w-full" />
        </UFormField>
      </template>

      <template v-else-if="currentQuestion.type === 'multiple'">
        <UFormField :label="$t('features.dashboard.schedule.quizzes.options')" name="options">
          <div
            v-for="option in currentQuestion.options"
            :key="option.id"
            class="grid grid-cols-[1fr_auto] gap-4 items-center"
          >
            <WidgetsTipTapViewer :content="option.text" />
            <UCheckbox
              size="xl"
              :disabled="loading"
              :model-value="state.options.includes(option.id)"
              @update:model-value="handleCheckboxChange(option.id, $event as boolean)"
            />
          </div>
        </UFormField>
      </template>

      <template #footer>
        <USkeleton v-if="status === 'pending'" class="h-8 w-full" />
        <UButton v-else block type="submit" :loading="loading">
          {{ $t("features.dashboard.schedule.quizzes.submit-answer") }}
        </UButton>
      </template>
    </UCard>
  </UForm>
  <UModal
    :dismissible="false"
    v-model:open="banModalOpen"
    :title="$t('features.dashboard.schedule.quizzes.cheat-attempt-title')"
    :description="$t('features.dashboard.schedule.quizzes.cheat-attempt-description')"
  >
    <template #body>
      <div class="rounded-lg max-w-lx overflow-hidden">
        <img :src="yellowCard" />
      </div>
    </template>
    <template #footer>
      <UButton block @click="banModalOpen = false">{{ $t("features.dashboard.schedule.quizzes.understood") }}</UButton>
    </template>
  </UModal>
  <UModal
    :dismissible="false"
    v-model:open="finalBanModalOpen"
    :title="$t('features.dashboard.schedule.quizzes.cheat-attempt-title')"
    :description="$t('features.dashboard.schedule.quizzes.cheat-attempt-description-final')"
  >
    <template #body>
      <div class="rounded-lg max-w-lx overflow-hidden">
        <img :src="redCard" />
      </div>
    </template>
    <template #footer>
      <UButton block @click="banModalOpen = false">{{ $t("features.dashboard.schedule.quizzes.understood") }}</UButton>
    </template>
  </UModal>
</template>
