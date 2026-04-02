import { useState, type ReactElement } from "react";

// Explained by Web Dev simplified: https://youtu.be/uDCBSnWkuH0
export function useMultistepForm(steps: ReactElement[]) {
  // 0 for Projects
  // 1 For Buildings
  // 2 For Houses
  const [CurrentStepIndex, setCurrentStepIndex] = useState<number>(0);

  function next() {
    setCurrentStepIndex((prevIndex) => {
      if (prevIndex >= steps.length - 1) return prevIndex;
      return prevIndex + 1;
    });
  }

  function back() {
    setCurrentStepIndex((prevIndex) => {
      if (prevIndex <= 0) return prevIndex;
      return prevIndex - 1;
    });
  }

  function goTo(index: number) {
    setCurrentStepIndex(index);
  }

  return {
    CurrentStepIndex,
    step: steps[CurrentStepIndex],
    steps,
    isFirstStep: CurrentStepIndex === 0,
    isLastStep: CurrentStepIndex === steps.length - 1,
    next,
    back,
    goTo,
  };
}
