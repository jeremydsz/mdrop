"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadMarkdownNote } from "@/lib/note-download";

type DownloadNoteButtonProps = {
  content: string;
  title?: string;
  iconOnly?: boolean;
};

export function DownloadNoteButton({ content, title, iconOnly = false }: DownloadNoteButtonProps) {
  const handleDownload = () => {
    downloadMarkdownNote(content, title);
  };

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleDownload}
        aria-label="Download note"
        title="Download note"
      >
        <Download className="size-4" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDownload}>
      <Download className="size-4 mr-1" />
      Download
    </Button>
  );
}
