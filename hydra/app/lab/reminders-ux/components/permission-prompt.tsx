"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RiNotification3Line,
  RiDropLine,
  RiShieldCheckLine,
  RiCloseLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

type PermissionState = "prompt" | "granted" | "denied";

export function PermissionPrompt() {
  const [state, setState] = useState<PermissionState>("prompt");
  const [animating, setAnimating] = useState(false);

  function handleEnable() {
    setAnimating(true);
    setTimeout(() => {
      setState("granted");
      setAnimating(false);
    }, 600);
  }

  function handleDeny() {
    setState("denied");
  }

  function handleReset() {
    setState("prompt");
  }

  if (state === "granted") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 px-6 pt-16 pb-8">
        {/* Success state */}
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10">
            <RiShieldCheckLine className="size-10 text-emerald-500" />
          </div>
          <div className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <RiNotification3Line className="size-3.5" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            You&apos;re all set!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We&apos;ll send gentle reminders to keep you hydrated. You can
            customize your schedule anytime.
          </p>
        </div>

        {/* What to expect */}
        <div className="w-full space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            What to expect
          </p>
          {[
            {
              time: "Morning",
              text: "Start your day with a hydration check-in",
            },
            {
              time: "Throughout",
              text: "Gentle nudges every hour during active hours",
            },
            { time: "Evening", text: "Daily summary with your progress" },
          ].map((item) => (
            <div
              key={item.time}
              className="flex items-start gap-3 rounded-xl bg-muted/50 px-4 py-3"
            >
              <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {item.time}
                </p>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full" size="lg" onClick={handleReset}>
          Customize schedule
        </Button>

        <button
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Reset demo
        </button>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 px-6 pt-20 pb-8">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-muted">
          <RiNotification3Line className="size-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            No problem
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You can enable reminders later from Settings. We&apos;ll still track
            your hydration — just without the nudges.
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleReset}>
          Reset demo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between px-6 pt-10 pb-8">
      {/* Illustration */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Ripple rings */}
          <div
            className={cn(
              "absolute inset-0 -m-6 rounded-full border-2 border-primary/10 transition-all duration-700",
              animating && "scale-150 opacity-0"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 -m-3 rounded-full border-2 border-primary/20 transition-all duration-500",
              animating && "scale-125 opacity-0"
            )}
          />

          {/* Main icon */}
          <div
            className={cn(
              "relative flex size-24 items-center justify-center rounded-3xl bg-primary/10 transition-transform duration-300",
              animating && "scale-95"
            )}
          >
            <RiDropLine className="absolute -top-2 -right-2 size-6 text-primary/40" />
            <RiNotification3Line
              className={cn(
                "size-12 text-primary transition-transform duration-300",
                animating && "scale-110"
              )}
            />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Stay on track
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Get gentle reminders throughout the day so you never forget to drink
            water. Customizable schedule, no spam.
          </p>
        </div>

        {/* Benefits */}
        <div className="w-full space-y-2.5">
          {[
            { icon: "schedule", text: "Custom schedule that fits your day" },
            { icon: "smart", text: "Smart reminders based on your progress" },
            { icon: "quiet", text: "Respects quiet hours and focus time" },
          ].map((benefit) => (
            <div
              key={benefit.icon}
              className="flex items-center gap-3 rounded-xl px-3 py-2"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <div className="size-1.5 rounded-full bg-primary" />
              </div>
              <p className="text-sm text-foreground">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-8 w-full space-y-3">
        <Button className="w-full" size="lg" onClick={handleEnable}>
          Enable notifications
        </Button>
        <button
          onClick={handleDeny}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RiCloseLine className="size-4" />
          Not now
        </button>
      </div>
    </div>
  );
}
