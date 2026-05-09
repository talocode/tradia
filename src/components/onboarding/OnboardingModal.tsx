// src/components/onboarding/OnboardingModal.tsx
"use client";

import React from "react";
import { useOnboarding, OnboardingStep } from "@/hooks/useOnboarding";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Upload, Settings, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STEPS_CONFIG: Record<OnboardingStep, { title: string; description: string; icon: React.ReactNode }> = {
  welcome: {
    title: "Welcome to Tradia",
    description: "Your AI-powered trading journal awaits. Let's get you set up in minutes.",
    icon: <Sparkles className="w-12 h-12 text-blue-500" />,
  },
  "create-account": {
    title: "Create Your Trading Account",
    description: "Add your trading account to start tracking your performance.",
    icon: <Settings className="w-12 h-12 text-green-500" />,
  },
  "import-trades": {
    title: "Import Your Trades",
    description: "Upload your trade history from CSV or connect your broker.",
    icon: <Upload className="w-12 h-12 text-purple-500" />,
  },
  "setup-preferences": {
    title: "Set Your Preferences",
    description: "Configure your risk settings and trading goals.",
    icon: <Settings className="w-12 h-12 text-orange-500" />,
  },
  complete: {
    title: "You're All Set!",
    description: "Start analyzing your trades and building your edge.",
    icon: <Check className="w-12 h-12 text-emerald-500" />,
  },
};

export default function OnboardingModal() {
  const { 
    isComplete, 
    currentStep, 
    hasAccount, 
    hasTrades, 
    hasPreferences,
    completeStep, 
    skipOnboarding, 
    completeOnboarding 
  } = useOnboarding();

  if (isComplete) return null;

  const config = STEPS_CONFIG[currentStep];
  const stepOrder: OnboardingStep[] = ["welcome", "create-account", "import-trades", "setup-preferences", "complete"];
  const currentIndex = stepOrder.indexOf(currentStep);

  const getActionButton = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <Button onClick={() => completeStep("welcome")} className="w-full">
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        );
      case "create-account":
        return hasAccount ? (
          <Button onClick={() => completeStep("create-account")} className="w-full">
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <div className="space-y-2">
            <Link href="/dashboard/accounts/add">
              <Button className="w-full">Add Trading Account</Button>
            </Link>
            <Button variant="outline" onClick={() => completeStep("create-account")} className="w-full">
              Skip for now
            </Button>
          </div>
        );
      case "import-trades":
        return hasTrades ? (
          <Button onClick={() => completeStep("import-trades")} className="w-full">
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <div className="space-y-2">
            <Link href="/dashboard/trades/import">
              <Button className="w-full">Import Trades</Button>
            </Link>
            <Button variant="outline" onClick={() => completeStep("import-trades")} className="w-full">
              Skip for now
            </Button>
          </div>
        );
      case "setup-preferences":
        return hasPreferences ? (
          <Button onClick={completeOnboarding} className="w-full">
            Finish <Check className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <div className="space-y-2">
            <Link href="/dashboard/settings">
              <Button className="w-full">Configure Settings</Button>
            </Link>
            <Button variant="outline" onClick={completeOnboarding} className="w-full">
              Skip for now
            </Button>
          </div>
        );
      case "complete":
        return (
          <Button onClick={completeOnboarding} className="w-full">
            Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        );
    }
  };

  return (
    <Dialog open={!isComplete}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">{config.icon}</div>
          <DialogTitle className="text-center text-xl">{config.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 mb-6">
          {stepOrder.slice(0, -1).map((step, index) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-colors ${
                index < currentIndex ? "bg-blue-500" : index === currentIndex ? "bg-blue-300" : "bg-gray-200"
              }`}
              style={{ width: index < currentIndex ? "24px" : "16px" }}
            />
          ))}
        </div>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          {config.description}
        </p>

        <div className="space-y-4">
          {currentStep !== "complete" && (
            <Button variant="ghost" onClick={skipOnboarding} className="w-full text-sm text-gray-500 dark:text-gray-400">
              Skip onboarding
            </Button>
          )}
          {getActionButton()}
        </div>
      </DialogContent>
    </Dialog>
  );
}