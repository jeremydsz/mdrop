"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type QuickStartGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const QUICK_START_ITEMS = [
  "Create a note in markdown with a title and content.",
  "Type / in the editor to insert markdown blocks quickly.",
  "Paste links to include rich link previews in notes.",
  "Tag notes so they are easy to find from the dashboard.",
  "Copy and share note links instantly with anyone.",
];

export function QuickStartGuideDialog({
  open,
  onOpenChange,
}: QuickStartGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Quick start guide</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          <ul className="space-y-2">
            {QUICK_START_ITEMS.map((item) => (
              <li
                key={item}
                className="text-body text-[var(--text-secondary)] leading-6"
              >
                • {item}
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href="/new" onClick={() => onOpenChange(false)}>
                Create new note
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
