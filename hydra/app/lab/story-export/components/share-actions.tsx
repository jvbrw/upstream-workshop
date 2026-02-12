"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import {
  RiShareLine,
  RiDownloadLine,
  RiCheckLine,
  RiLoaderLine,
} from "@remixicon/react";

export type ShareActionsProps = {
  cardRef: React.RefObject<HTMLDivElement | null>;
};

export function ShareActions({ cardRef }: ShareActionsProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function captureCard(): Promise<Blob | null> {
    if (!cardRef.current) return null;

    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 3,
      cacheBust: true,
    });

    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function handleShare() {
    setStatus("loading");
    try {
      const blob = await captureCard();
      if (!blob) return;

      const file = new File([blob], "hydra-story.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Hydration Goal",
          text: "I hit my daily hydration goal with Hydra!",
        });
      } else {
        await downloadImage(blob);
      }
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  async function handleDownload() {
    setStatus("loading");
    try {
      const blob = await captureCard();
      if (!blob) return;
      await downloadImage(blob);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="flex w-[360px] gap-3">
      <Button
        className="flex-1 gap-2"
        size="lg"
        onClick={handleShare}
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <RiLoaderLine className="size-5 animate-spin" />
        ) : status === "done" ? (
          <RiCheckLine className="size-5" />
        ) : (
          <RiShareLine className="size-5" />
        )}
        {status === "done" ? "Shared!" : "Share to Stories"}
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={handleDownload}
        disabled={status === "loading"}
        className="gap-2"
      >
        <RiDownloadLine className="size-5" />
        Save
      </Button>
    </div>
  );
}

async function downloadImage(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hydra-story.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
