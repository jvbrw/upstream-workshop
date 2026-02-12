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

export type ShareButtonProps = {
  cardRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  shareText?: string;
};

export function ShareButton({
  cardRef,
  filename = "hydra-share.png",
  shareText = "Check out my hydration progress with Hydra!",
}: ShareButtonProps) {
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

      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Hydra",
          text: shareText,
        });
      } else {
        await downloadImage(blob, filename);
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
      await downloadImage(blob, filename);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="flex gap-3">
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
        {status === "done" ? "Shared!" : "Share"}
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={handleDownload}
        disabled={status === "loading"}
        className="gap-2"
      >
        <RiDownloadLine className="size-5" />
      </Button>
    </div>
  );
}

async function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
