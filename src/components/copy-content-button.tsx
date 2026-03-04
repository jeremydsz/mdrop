"use client";

import { useState, type MouseEvent } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyContentButtonProps = {
  content: string;
  iconOnly?: boolean;
  className?: string;
  onCopySuccess?: () => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function CopyContentButton({
  content,
  iconOnly = false,
  className,
  onCopySuccess,
  onClick,
}: CopyContentButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

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
        className={className}
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
    <Button variant="ghost" size="sm" className={className} onClick={handleCopy}>
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
