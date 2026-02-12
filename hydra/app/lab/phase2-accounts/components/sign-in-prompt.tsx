"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiGoogleLine, RiDropLine, RiDeviceLine, RiShieldCheckLine, RiLoopLeftLine } from "@remixicon/react";

export type SignInPromptProps = {
  hasLocalData: boolean;
  onSignIn: () => void;
  onSkip: () => void;
};

export function SignInPrompt({ hasLocalData, onSignIn, onSkip }: SignInPromptProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <RiDropLine className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">hydra</h1>
        <p className="text-center text-sm text-muted-foreground">
          Build your hydration habit,<br />one glass at a time
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-8 w-full max-w-sm space-y-3">
        {[
          { icon: RiLoopLeftLine, text: "Sync across all your devices" },
          { icon: RiShieldCheckLine, text: "Keep your data safe in the cloud" },
          { icon: RiDeviceLine, text: "Pick up where you left off, anywhere" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <item.icon className="size-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-foreground">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Sign in button */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          className="w-full gap-3 text-base"
          size="lg"
          onClick={onSignIn}
        >
          <RiGoogleLine className="size-5" />
          Continue with Google
        </Button>

        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          size="sm"
          onClick={onSkip}
        >
          {hasLocalData ? "Continue without account" : "Try without account"}
        </Button>
      </div>

      {/* Privacy note */}
      <p className="mt-6 max-w-xs text-center text-xs text-muted-foreground/70">
        Your hydration data stays private. We only use your Google account for authentication.
      </p>
    </div>
  );
}
