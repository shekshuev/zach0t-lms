export function useCheaterDetector(onCheatAttempt: () => void) {
  const trigger = () => {
    onCheatAttempt();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      trigger();
    }
  };

  const handleBlur = () => {
    trigger();
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
