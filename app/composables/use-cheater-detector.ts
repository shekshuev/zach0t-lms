export function useCheaterDetector(maxAttempts: number, onCheatAttempt: (attempts: number) => void) {
  const attempts = ref(0);

  const trigger = () => {
    onCheatAttempt(++attempts.value);
    if (attempts.value >= maxAttempts) {
      lock();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      trigger();
    }
  };

  const handleBlur = () => {
    trigger();
  };

  const lock = () => {
    // TODO: implement later
  };

  onMounted(() => {
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("blur", handleBlur);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });
}
