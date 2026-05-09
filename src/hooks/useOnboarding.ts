// src/hooks/useOnboarding.ts
"use client";

import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "tradia_onboarding_complete";
const ONBOARDING_STEP_KEY = "tradia_onboarding_step";

export type OnboardingStep = 
  | "welcome"
  | "create-account"
  | "import-trades"
  | "setup-preferences"
  | "complete";

interface OnboardingState {
  isComplete: boolean;
  currentStep: OnboardingStep;
  hasAccount: boolean;
  hasTrades: boolean;
  hasPreferences: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isComplete: false,
    currentStep: "welcome",
    hasAccount: false,
    hasTrades: false,
    hasPreferences: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    const stored = localStorage.getItem(ONBOARDING_KEY);
    const step = localStorage.getItem(ONBOARDING_STEP_KEY) as OnboardingStep | null;
    
    if (stored === "true") {
      setState(s => ({ ...s, isComplete: true, currentStep: "complete" }));
    } else {
      setState(s => ({ ...s, currentStep: step || "welcome" }));
    }
    setIsLoading(false);
  }, []);

  const completeStep = useCallback((step: OnboardingStep) => {
    let nextStep: OnboardingStep = "welcome";
    
    switch (step) {
      case "welcome":
        nextStep = "create-account";
        break;
      case "create-account":
        nextStep = "import-trades";
        setState(s => ({ ...s, hasAccount: true }));
        break;
      case "import-trades":
        nextStep = "setup-preferences";
        setState(s => ({ ...s, hasTrades: true }));
        break;
      case "setup-preferences":
        nextStep = "complete";
        setState(s => ({ ...s, hasPreferences: true }));
        break;
      case "complete":
        return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_STEP_KEY, nextStep);
    }
    setState(s => ({ ...s, currentStep: nextStep }));
  }, []);

  const skipOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
      localStorage.removeItem(ONBOARDING_STEP_KEY);
    }
    setState(s => ({ ...s, isComplete: true, currentStep: "complete" }));
  }, []);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
      localStorage.removeItem(ONBOARDING_STEP_KEY);
    }
    setState(s => ({ ...s, isComplete: true, currentStep: "complete" }));
  }, []);

  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(ONBOARDING_STEP_KEY);
    }
    setState({
      isComplete: false,
      currentStep: "welcome",
      hasAccount: false,
      hasTrades: false,
      hasPreferences: false,
    });
  }, []);

  return {
    ...state,
    isLoading,
    completeStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}