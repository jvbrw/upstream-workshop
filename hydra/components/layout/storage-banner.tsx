"use client";

import { useIsEphemeral } from "@/hooks/use-hydration-store";

export function StorageBanner() {
  const isEphemeral = useIsEphemeral();

  if (!isEphemeral) return null;

  return (
    <div className="bg-yellow-500/10 px-4 py-2 text-center text-xs text-yellow-700 dark:text-yellow-400">
      Your data won&apos;t be saved in this session.
    </div>
  );
}
