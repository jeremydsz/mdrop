"use client";

import { useState, type MouseEvent } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyNoteLink } from "@/lib/copy-link";

type CopyLinkButtonProps = {
  noteId: string;
  iconOnly?: boolean;
  onCopySuccess?: () => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function CopyLinkButton({
  noteId,
  iconOnly = false,
  onCopySuccess,
  onClick,
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event);

    await copyNoteLink(noteId);
    setCopied(true);
    onCopySuccess?.();
    setTimeout(() => setCopied(false), 2000);
  };

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Copied" : "Copy link"}
      >
        {copied ? (
          <Check className="size-4 text-[var(--accent)]" />
        ) : (
          <Link2 className="size-4" />
        )}
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="size-4 mr-1 text-[var(--accent)]" />
          Copied
        </>
      ) : (
        <>
          <Link2 className="size-4 mr-1" />
          Copy link
        </>
      )}
    </Button>
  );
}
