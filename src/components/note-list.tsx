"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Check, Download, Trash2, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DeleteNoteDialog } from "@/components/delete-note-dialog";
import { CopyContentButton } from "@/components/copy-content-button";
import { IconActionRow } from "@/components/ui/icon-action-row";
import { downloadMarkdownNote } from "@/lib/note-download";
import { copyNoteLink } from "@/lib/copy-link";
import type { NoteWithDisplayTitle } from "@/types/database";

type NoteListProps = {
  notes: NoteWithDisplayTitle[];
  currentUserId?: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function NoteRow({ note, currentUserId }: { note: NoteWithDisplayTitle; currentUserId?: string }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isOwner = currentUserId === note.author_id;

  const handleCopyLink = async () => {
    await copyNoteLink(note.id);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadMarkdownNote(note.content, note.displayTitle);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div
        className="group flex items-center justify-between gap-4 px-4 py-3 -mx-4 rounded-[10px] transition-colors hover:bg-[var(--surface-raised)]"
      >
        <Link href={`/n/${note.id}`} className="flex-1 min-w-0 block">
          <h3 className="text-body font-medium text-[var(--text-primary)] truncate">
            {note.displayTitle}
          </h3>
          <div className="mt-1">
            <div className="flex items-center gap-2 text-caption text-[var(--text-secondary)]">
              <Avatar size="sm">
                <AvatarImage src={note.author_image || undefined} />
                <AvatarFallback>
                  {note.author_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span>{note.author_name}</span>
              <span>·</span>
              <span>{formatDate(note.created_at)}</span>
              {note.visibility === "private" && (
                <>
                  <span>·</span>
                  <Lock className="size-3" />
                </>
              )}
            </div>
            {note.tags.length > 0 && (
              <div className="flex gap-1.5 mt-1.5">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 text-xs rounded-[6px] bg-[var(--accent-subtle)] text-[var(--accent-subtle-foreground)]"
                  >
                    {tag.name}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs text-[var(--text-tertiary)]">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
        <IconActionRow hoverReveal>
          <CopyContentButton content={note.content} iconOnly />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopyLink}
            aria-label={linkCopied ? "Link copied" : "Copy link"}
            title={linkCopied ? "Copied" : "Copy link"}
          >
            {linkCopied ? (
              <Check className="size-4 text-[var(--accent)]" />
            ) : (
              <Link2 className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownload}
            aria-label="Download note"
            title="Download note"
          >
            <Download className="size-4" />
          </Button>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              aria-label="Delete note"
              title="Delete note"
              className="text-[var(--text-tertiary)] hover:text-[var(--destructive)]"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </IconActionRow>
      </div>
      {isOwner && (
        <DeleteNoteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          noteId={note.id}
          noteTitle={note.displayTitle}
        />
      )}
    </>
  );
}

export function NoteList({ notes, currentUserId }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-body text-[var(--text-secondary)] mb-4">
          No notes yet. Create your first one.
        </p>
        <Button asChild>
          <Link href="/new">Create note</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {notes.map((note) => (
        <NoteRow key={note.id} note={note} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
