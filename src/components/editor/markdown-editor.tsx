"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Eye, Edit2, Trash2, Globe, Lock } from "lucide-react";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MarkdownDropOverlay } from "@/components/editor/markdown-drop-overlay";
import { TagInput } from "@/components/editor/tag-input";
import { DeleteNoteDialog } from "@/components/delete-note-dialog";
import { CopyContentButton } from "@/components/copy-content-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DownloadNoteButton } from "@/components/download-note-button";
import { IconActionRow } from "@/components/ui/icon-action-row";
import { fieldControlClass } from "@/components/ui/field-styles";
import { cn } from "@/lib/utils";
import {
  consumeStagedMarkdownImport,
  findMarkdownFile,
  hasStagedMarkdownImport,
  hasFilePayload,
  readFileAsText,
} from "@/lib/markdown-file-drop";
import {
  extractTitleFromMarkdown,
  insertSlashCommand,
  getCaretCoordinates,
} from "@/lib/markdown";
import { filterCommands } from "@/components/editor/slash-commands";
import type { SlashCommand } from "@/components/editor/slash-commands";
import { SlashCommandMenu } from "@/components/editor/slash-command-menu";
import type { Tag, Note } from "@/types/database";
import type { AuthUser } from "@/lib/auth";

type MarkdownEditorProps = {
  user: AuthUser;
  existingTags: Tag[];
  existingNote?: Note & { tags: Tag[] };
};

export function MarkdownEditor({
  user,
  existingTags,
  existingNote,
}: MarkdownEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragDepthRef = useRef(0);
  const changeVersionRef = useRef(0);
  const restoreScrollYRef = useRef<number | null>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(
    null
  );
  const [content, setContent] = useState(existingNote?.content || "");
  const [tags, setTags] = useState<string[]>(
    existingNote?.tags.map((t) => t.name) || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [savedNoteId, setSavedNoteId] = useState(existingNote?.id || "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [isDragging, setIsDragging] = useState(false);
  const [slashSession, setSlashSession] = useState<{
    startPos: number;
    query: string;
    menuPosition: { top: number; left: number };
  } | null>(null);
  const [slashActiveIndex, setSlashActiveIndex] = useState(0);
  const [visibility, setVisibility] = useState<"public" | "private">(
    existingNote?.visibility || "public"
  );
  const [hasStagedImport] = useState(() => hasStagedMarkdownImport());

  const noteId = existingNote?.id || savedNoteId;
  const isEditMode = !!noteId;

  const { title, contentWithoutTitle } = useMemo(
    () => extractTitleFromMarkdown(content),
    [content]
  );
  const displayTitle = title || "Untitled";
  const hasContent = content.trim().length > 0;
  const importRequested = searchParams.get("import") === "1";
  const isImportFlow = importRequested || hasStagedImport;
  const backHref = isImportFlow ? "/" : isEditMode ? `/n/${noteId}` : "/";
  const persistedTitle = title || "Untitled";
  const canSave = hasContent;
  const filteredCommands = slashSession
    ? filterCommands(slashSession.query)
    : [];

  const saveStatusLabel = useMemo(() => {
    if (isSaving) return "Saving...";
    if (saveError) return "Couldn't save";
    if (hasPendingChanges && canSave) return "Unsaved changes";
    if (!canSave && !noteId) return "Draft";
    return "All changes saved";
  }, [canSave, hasPendingChanges, isSaving, noteId, saveError]);

  const handleContentChange = (newContent: string) => {
    changeVersionRef.current += 1;
    setHasPendingChanges(true);
    setSaveError(null);
    setContent(newContent);
  };

  const closeSlashMenu = () => {
    setSlashSession(null);
    setSlashActiveIndex(0);
  };

  const handleSlashSelect = (command: SlashCommand) => {
    if (!slashSession || !textareaRef.current) return;

    const cursor = textareaRef.current.selectionStart;
    const result = insertSlashCommand(
      content,
      slashSession.startPos,
      cursor,
      command
    );

    handleContentChange(result.newContent);
    pendingSelectionRef.current =
      result.selectStart !== undefined && result.selectEnd !== undefined
        ? { start: result.selectStart, end: result.selectEnd }
        : { start: result.cursorPos, end: result.cursorPos };

    closeSlashMenu();
  };

  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newContent = e.target.value;
    const cursor = e.target.selectionStart;
    handleContentChange(newContent);

    if (slashSession) {
      if (
        cursor <= slashSession.startPos ||
        newContent[slashSession.startPos] !== "/" ||
        newContent
          .substring(slashSession.startPos + 1, cursor)
          .includes("\n")
      ) {
        closeSlashMenu();
      } else {
        const query = newContent.substring(
          slashSession.startPos + 1,
          cursor
        );
        if (query !== slashSession.query) {
          setSlashSession((prev) =>
            prev ? { ...prev, query } : null
          );
          setSlashActiveIndex(0);
        }
      }
    } else if (
      cursor > 0 &&
      newContent[cursor - 1] === "/" &&
      (cursor === 1 ||
        newContent[cursor - 2] === "\n" ||
        newContent[cursor - 2] === " ")
    ) {
      const coords = getCaretCoordinates(e.target, cursor - 1);
      setSlashSession({
        startPos: cursor - 1,
        query: "",
        menuPosition: {
          top: coords.top + coords.lineHeight + 4,
          left: coords.left,
        },
      });
      setSlashActiveIndex(0);
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void handleOpenViewer();
      return;
    }

    if (!slashSession) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSlashActiveIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSlashActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredCommands[slashActiveIndex];
      if (cmd) handleSlashSelect(cmd);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeSlashMenu();
    }
  };

  const processDroppedFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      void readFileAsText(file)
        .then((text) => {
          changeVersionRef.current += 1;
          setHasPendingChanges(true);
          setSaveError(null);
          setContent(text);
        })
        .catch((error) => {
          console.error("Error importing markdown file in editor:", error);
        });
    },
    []
  );

  const handleSave = useCallback(async (): Promise<string | null> => {
    if (!content.trim()) return noteId || null;
    if (isSaving) return noteId || null;

    setIsSaving(true);
    const supabase = createClient();
    const saveVersion = changeVersionRef.current;

    try {
      const nextNoteId = noteId || nanoid(10);

      if (isEditMode) {
        const { error } = await supabase
          .from("notes")
          .update({
            title: persistedTitle,
            content: content.trim(),
            visibility,
          })
          .eq("id", nextNoteId);

        if (error) throw error;

        await supabase.from("note_tags").delete().eq("note_id", nextNoteId);
      } else {
        const { error } = await supabase.from("notes").insert({
          id: nextNoteId,
          title: persistedTitle,
          content: content.trim(),
          author_id: user.id,
          author_name: user.name,
          author_image: user.image,
          visibility,
        });

        if (error) throw error;
      }

      for (const tagName of tags) {
        let tagId: string;

        const { data: existingTag } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single();

        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag, error: tagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single();

          if (tagError) throw tagError;
          tagId = newTag.id;
        }

        await supabase.from("note_tags").insert({
          note_id: nextNoteId,
          tag_id: tagId,
        });
      }

      setSavedNoteId(nextNoteId);
      if (changeVersionRef.current === saveVersion) {
        setHasPendingChanges(false);
      }
      setSaveError(null);

      return nextNoteId;
    } catch (error) {
      console.error("Error saving note:", error);
      setSaveError("Couldn't save. Check your connection and try again.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    content,
    isEditMode,
    isSaving,
    noteId,
    persistedTitle,
    tags,
    user,
    visibility,
  ]);

  const handleOpenViewer = useCallback(async () => {
    if (isSaving) return;

    if (noteId && !hasPendingChanges) {
      router.push(`/n/${noteId}?from=editor`);
      return;
    }

    const nextNoteId = await handleSave();
    if (nextNoteId) {
      router.push(`/n/${nextNoteId}?from=editor`);
    }
  }, [handleSave, hasPendingChanges, isSaving, noteId, router]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    if (restoreScrollYRef.current !== null) {
      const scrollY = restoreScrollYRef.current;
      restoreScrollYRef.current = null;
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY });
      });
    }
  }, [content]);

  useEffect(() => {
    if (pendingSelectionRef.current && textareaRef.current) {
      const { start, end } = pendingSelectionRef.current;
      textareaRef.current.setSelectionRange(start, end);
      textareaRef.current.focus();
      pendingSelectionRef.current = null;
    }
  }, [content]);

  useEffect(() => {
    const startPos = slashSession?.startPos;
    if (startPos === undefined || !textareaRef.current) return;
    const textarea = textareaRef.current;

    const onScroll = () => {
      const coords = getCaretCoordinates(textarea, startPos);
      setSlashSession((prev) =>
        prev
          ? {
              ...prev,
              menuPosition: {
                top: coords.top + coords.lineHeight + 4,
                left: coords.left,
              },
            }
          : null
      );
    };

    textarea.addEventListener("scroll", onScroll);
    return () => textarea.removeEventListener("scroll", onScroll);
  }, [slashSession?.startPos]);

  useEffect(() => {
    if (!hasPendingChanges || isSaving) return;
    if (!canSave) return;
    const timeoutId = setTimeout(() => {
      void handleSave();
    }, 1200);
    return () => clearTimeout(timeoutId);
  }, [content, handleSave, hasPendingChanges, isSaving, tags, canSave]);

  useEffect(() => {
    if (isEditMode) return;
    if (!importRequested) return;
    if (content.trim().length > 0) return;

    const stagedImport = consumeStagedMarkdownImport();
    if (!stagedImport) return;

    changeVersionRef.current += 1;
    setHasPendingChanges(true);
    setSaveError(null);
    setContent(stagedImport.content);
  }, [content, importRequested, isEditMode]);

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      dragDepthRef.current += 1;
      setIsDragging(true);
    };

    const onDragOver = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
      setIsDragging(true);
    };

    const onDragLeave = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDragging(false);
      }
    };

    const onDrop = (e: DragEvent) => {
      if (!hasFilePayload(e.dataTransfer)) return;
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsDragging(false);
      processDroppedFile(findMarkdownFile(e.dataTransfer));
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
  }, [processDroppedFile]);

  const canOpenViewer = Boolean(noteId) || canSave;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[var(--border)] sm:px-6 sm:py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2 lg:flex-none">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back"
            title="Back"
            asChild
          >
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant={viewMode === "edit" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
            >
              <Edit2 className="size-4" />
            </Button>
            <Button
              variant={viewMode === "preview" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("preview")}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        </div>
        <div className="order-3 flex w-full items-center justify-center gap-2 lg:order-none lg:w-auto">
          <p className="text-caption text-[var(--text-secondary)] text-center">
            {saveStatusLabel}
          </p>
          {saveError && (
            <Button variant="ghost" size="sm" onClick={() => void handleSave()}>
              Retry
            </Button>
          )}
        </div>
        <IconActionRow className="ml-auto justify-end lg:ml-0">
          <CopyContentButton content={content} iconOnly />
          {noteId && (
            <CopyLinkButton
              noteId={noteId}
              iconOnly
            />
          )}
          <DownloadNoteButton content={content} title={title || undefined} iconOnly />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open viewer"
            title="Open viewer (Ctrl/Cmd+Enter)"
            onClick={() => void handleOpenViewer()}
            disabled={!canOpenViewer || isSaving}
          >
            <ArrowUpRight className="size-4" />
          </Button>
          {isEditMode && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete note"
              title="Delete note"
              className="text-[var(--text-tertiary)] hover:text-[var(--destructive)] focus-visible:text-[var(--destructive)]"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </IconActionRow>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <div
          className={cn(
            "flex-1 min-h-0 flex flex-col p-6 lg:border-r border-[var(--border)]",
            viewMode === "preview" && "hidden lg:flex"
          )}
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <TagInput
                tags={tags}
                onTagsChange={(nextTags) => {
                  changeVersionRef.current += 1;
                  setHasPendingChanges(true);
                  setSaveError(null);
                  setTags(nextTags);
                }}
                existingTags={existingTags}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = visibility === "public" ? "private" : "public";
                setVisibility(next);
                changeVersionRef.current += 1;
                setHasPendingChanges(true);
                setSaveError(null);
              }}
              className="shrink-0 gap-1.5 text-[var(--text-secondary)]"
            >
              {visibility === "public" ? (
                <Globe className="size-4" />
              ) : (
                <Lock className="size-4" />
              )}
              {visibility === "public" ? "Public" : "Private"}
            </Button>
          </div>

          <div
            className={cn(
              "flex-1 min-h-0 relative rounded-[10px] transition-colors",
              isDragging && "bg-[var(--accent-subtle)]"
            )}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onPaste={() => {
                restoreScrollYRef.current = window.scrollY;
              }}
              onKeyDown={handleTextareaKeyDown}
              onBlur={closeSlashMenu}
              onClick={() => {
                if (slashSession && textareaRef.current) {
                  const cursor = textareaRef.current.selectionStart;
                  if (cursor <= slashSession.startPos) closeSlashMenu();
                }
              }}
              placeholder={"# Title\n\nWrite in Markdown..."}
              className={cn(
                fieldControlClass,
                "w-full min-h-[400px] resize-none overflow-hidden p-4 text-mono text-[0.9375rem] leading-[1.6]"
              )}
            />
            <SlashCommandMenu
              commands={filteredCommands}
              activeIndex={slashActiveIndex}
              position={slashSession?.menuPosition ?? null}
              onSelect={handleSlashSelect}
              onHover={setSlashActiveIndex}
            />
          </div>
        </div>

        <div
          className={cn(
            "flex-1 min-h-0 p-6 bg-[var(--surface)]",
            viewMode === "edit" && "hidden lg:block"
          )}
        >
          <div className="max-w-[680px] mx-auto">
            <h1 className="text-display text-[var(--text-primary)] mb-4">
              {displayTitle}
            </h1>
            {contentWithoutTitle ? (
              <MarkdownRenderer content={contentWithoutTitle} />
            ) : (
              <p className="text-body text-[var(--text-tertiary)]">
                {title ? "Add content below the title..." : "Start with # Your title"}
              </p>
            )}
          </div>
        </div>
      </div>

      {isDragging && <MarkdownDropOverlay />}

      {isEditMode && noteId && (
        <DeleteNoteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          noteId={noteId}
          noteTitle={displayTitle}
        />
      )}
    </div>
  );
}
