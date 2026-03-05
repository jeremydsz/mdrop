"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  ChevronDown,
  ChevronUp,
  Code2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getTransition } from "@/lib/motion";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { Comment } from "@/types/database";
import type { AuthUser } from "@/lib/auth";

type CommentsProps = {
  noteId: string;
  noteAuthorId: string;
  comments: Comment[];
  user: AuthUser | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

export function Comments({
  noteId,
  noteAuthorId,
  comments,
  user,
}: CommentsProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textareaEl, setTextareaEl] = useState<HTMLTextAreaElement | null>(null);
  const canSubmitComment = !!newComment.trim() && !isSubmitting;

  const applyInlineFormat = (
    before: string,
    after: string,
    fallbackText: string
  ) => {
    if (!textareaEl) return;
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    const selected = newComment.slice(start, end);
    const replacement = selected || fallbackText;
    const updated =
      newComment.slice(0, start) +
      before +
      replacement +
      after +
      newComment.slice(end);

    setNewComment(updated);

    requestAnimationFrame(() => {
      textareaEl.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + replacement.length;
      textareaEl.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const applyLinePrefix = (
    prefixForLine: (line: string, index: number) => string
  ) => {
    if (!textareaEl) return;
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;

    const lineStart = newComment.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineEnd = (() => {
      const idx = newComment.indexOf("\n", end);
      return idx === -1 ? newComment.length : idx;
    })();

    const target = newComment.slice(lineStart, lineEnd);
    const lines = target.split("\n");
    const prefixed = lines.map((line, index) => `${prefixForLine(line, index)}${line}`);
    const replacement = prefixed.join("\n");
    const updated =
      newComment.slice(0, lineStart) + replacement + newComment.slice(lineEnd);

    setNewComment(updated);

    requestAnimationFrame(() => {
      textareaEl.focus();
      textareaEl.setSelectionRange(lineStart, lineStart + replacement.length);
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("comments").insert({
        note_id: noteId,
        author_id: user.id,
        author_name: user.name,
        author_image: user.image,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      router.refresh();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const canDeleteComment = (comment: Comment) => {
    if (!user) return false;
    return user.id === comment.author_id || user.id === noteAuthorId;
  };

  const handleCommentComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isSubmitShortcut =
      event.key === "Enter" && (event.metaKey || event.ctrlKey);

    if (!isSubmitShortcut) {
      return;
    }

    event.preventDefault();
    if (!canSubmitComment || !user) {
      return;
    }

    void handleSubmitComment();
  };

  return (
    <div className="mt-12 pt-8 border-t border-[var(--border)]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-caption text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={getTransition("smooth", prefersReducedMotion ?? false)}
            className="overflow-hidden"
          >
            <div className="mt-6 space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group flex gap-3 pb-6 border-b border-[var(--border)] last:border-b-0"
                >
                  <Avatar size="sm">
                    <AvatarImage src={comment.author_image || undefined} />
                    <AvatarFallback>
                      {comment.author_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-caption">
                        <span className="font-medium text-[var(--text-primary)]">
                          {comment.author_name}
                        </span>
                        <span className="text-[var(--text-tertiary)]">·</span>
                        <span className="text-[var(--text-secondary)]">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {canDeleteComment(comment) && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-[var(--text-tertiary)] opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 hover:text-[var(--destructive)] focus-visible:text-[var(--destructive)]"
                          aria-label="Delete comment"
                          title="Delete comment"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                    <MarkdownRenderer
                      content={comment.content}
                      className="prose-comment max-w-none mt-1"
                    />
                  </div>
                </div>
              ))}

              {user ? (
                <div className="pt-2">
                  <div className="mb-2 flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Bold"
                      title="Bold"
                      onClick={() => applyInlineFormat("**", "**", "bold")}
                    >
                      <Bold className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Italic"
                      title="Italic"
                      onClick={() => applyInlineFormat("*", "*", "italic")}
                    >
                      <Italic className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Bullet list"
                      title="Bullet list"
                      onClick={() => applyLinePrefix(() => "- ")}
                    >
                      <List className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Numbered list"
                      title="Numbered list"
                      onClick={() =>
                        applyLinePrefix((_, index) => `${index + 1}. `)
                      }
                    >
                      <ListOrdered className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Quote"
                      title="Quote"
                      onClick={() => applyLinePrefix(() => "> ")}
                    >
                      <Quote className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Inline code"
                      title="Inline code"
                      onClick={() => applyInlineFormat("`", "`", "code")}
                    >
                      <Code2 className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Link"
                      title="Link"
                      onClick={() =>
                        applyInlineFormat("[", "](https://example.com)", "text")
                      }
                    >
                      <Link2 className="size-3" />
                    </Button>
                  </div>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleCommentComposerKeyDown}
                    ref={setTextareaEl}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  {newComment.trim() && (
                    <div className="mt-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-raised)] p-3">
                      <p className="text-caption text-[var(--text-secondary)] mb-2">
                        Preview
                      </p>
                      <MarkdownRenderer
                        content={newComment}
                        className="prose-comment max-w-none"
                      />
                    </div>
                  )}
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!canSubmitComment}
                      size="sm"
                      className="min-w-20"
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-caption text-[var(--text-secondary)] py-4">
                  Sign in to add a comment.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
