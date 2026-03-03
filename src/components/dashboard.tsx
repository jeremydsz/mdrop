"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader } from "@/components/dashboard-header";
import { TagFilter } from "@/components/tag-filter";
import { NoteList } from "@/components/note-list";
import { MarkdownDropOverlay } from "@/components/editor/markdown-drop-overlay";
import {
  findMarkdownFile,
  hasFilePayload,
  readFileAsText,
  stageMarkdownImport,
} from "@/lib/markdown-file-drop";
import type { NoteWithDisplayTitle, Tag } from "@/types/database";
import type { AuthUser } from "@/lib/auth";

type DashboardProps = {
  user: AuthUser;
  notes: NoteWithDisplayTitle[];
  tags: Tag[];
};

export function Dashboard({ user, notes, tags }: DashboardProps) {
  const router = useRouter();
  const dragDepthRef = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDraggingMarkdown, setIsDraggingMarkdown] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        searchQuery === "" ||
        note.displayTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tagId) =>
          note.tags.some((tag) => tag.id === tagId)
        );

      return matchesSearch && matchesTags;
    });
  }, [notes, searchQuery, selectedTags]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleDroppedMarkdown = useCallback(
    async (file: File | null) => {
      if (!file) return;

      try {
        const content = await readFileAsText(file);
        stageMarkdownImport({
          content,
          fileName: file.name,
          createdAt: Date.now(),
        });
        router.push("/new?import=1");
      } catch (error) {
        console.error("Error importing markdown file from dashboard:", error);
      }
    },
    [router]
  );

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      dragDepthRef.current += 1;
      setIsDraggingMarkdown(true);
    };

    const onDragOver = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
      setIsDraggingMarkdown(true);
    };

    const onDragLeave = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDraggingMarkdown(false);
      }
    };

    const onDrop = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingMarkdown(false);
      void handleDroppedMarkdown(findMarkdownFile(e.dataTransfer));
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
      dragDepthRef.current = 0;
    };
  }, [handleDroppedMarkdown]);

  return (
    <div className="min-h-screen">
      <DashboardHeader user={user} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button asChild>
            <Link href="/new">New note</Link>
          </Button>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text-tertiary)]" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mb-6">
            <TagFilter
              tags={tags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </div>
        )}

        <NoteList notes={filteredNotes} currentUserId={user.id} />
      </main>
      {isDraggingMarkdown && <MarkdownDropOverlay />}
    </div>
  );
}
