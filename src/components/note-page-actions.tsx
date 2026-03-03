"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconActionRow } from "@/components/ui/icon-action-row";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DownloadNoteButton } from "@/components/download-note-button";
import { DeleteNoteDialog } from "@/components/delete-note-dialog";

type NotePageActionsProps = {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  isAuthor: boolean;
};

export function NotePageActions({
  noteId,
  noteTitle,
  noteContent,
  isAuthor,
}: NotePageActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <IconActionRow>
        <DownloadNoteButton content={noteContent} title={noteTitle} iconOnly />
        <CopyLinkButton noteId={noteId} iconOnly />
        {isAuthor && (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete note"
              title="Delete note"
              className="text-[var(--text-tertiary)] hover:text-[var(--destructive)] focus-visible:text-[var(--destructive)]"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit note"
              title="Edit note"
              asChild
            >
              <Link href={`/n/${noteId}/edit`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
          </>
        )}
      </IconActionRow>
      {isAuthor && (
        <DeleteNoteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          noteId={noteId}
          noteTitle={noteTitle}
        />
      )}
    </>
  );
}
