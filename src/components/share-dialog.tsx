"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  visibility?: "public" | "private";
};

export function ShareDialog({ open, onOpenChange, noteId, visibility }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/n/${noteId}`
      : `/n/${noteId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <Input value={shareUrl} readOnly className="flex-1" />
          <Button onClick={handleCopy} className="shrink-0">
            {copied ? (
              <>
                <Check className="size-4 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4 mr-1" />
                Copy link
              </>
            )}
          </Button>
        </div>
        {visibility === "private" && (
          <p className="text-caption text-[var(--text-tertiary)] mt-2">
            Only you can view this note
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
