"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyContentButtonProps = {
  content: string;
  iconOnly?: boolean;
  onCopySuccess?: () => void;
};

export function CopyContentButton({
  content,
  iconOnly = false,
  onCopySuccess,
}: CopyContentButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
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
        aria-label={copied ? "Content copied" : "Copy content"}
        title={copied ? "Copied" : "Copy content"}
      >
        {copied ? (
          <Check className="size-4 text-[var(--accent)]" />
        ) : (
          <Copy className="size-4" />
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
          <Copy className="size-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}
