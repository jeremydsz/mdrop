import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Lock } from "lucide-react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Comments } from "@/components/comments";
import { NotePageActions } from "@/components/note-page-actions";
import { extractTitleFromMarkdown } from "@/lib/markdown";
import type { Note, Tag, Comment } from "@/types/database";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

async function getNote(id: string): Promise<
  | (Note & { tags: Tag[]; comments: Comment[] })
  | null
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  const note = data as Note;

  const { data: noteTags } = await supabase
    .from("note_tags")
    .select("tag_id")
    .eq("note_id", id);

  const tagIds = (noteTags as { tag_id: string }[])?.map((nt) => nt.tag_id) || [];
  let tags: Tag[] = [];

  if (tagIds.length > 0) {
    const { data: tagsData } = await supabase
      .from("tags")
      .select("*")
      .in("id", tagIds);
    tags = (tagsData as Tag[]) || [];
  }

  const { data: commentsData } = await supabase
    .from("comments")
    .select("*")
    .eq("note_id", id)
    .order("created_at", { ascending: true });

  return {
    ...note,
    tags,
    comments: (commentsData as Comment[]) || [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) {
    return {
      title: "Note not found",
    };
  }

  const { title: extractedTitle, contentWithoutTitle } = extractTitleFromMarkdown(note.content);
  const displayTitle = extractedTitle || note.title;

  const description =
    contentWithoutTitle.slice(0, 160).replace(/[#*_`]/g, "") + "...";

  return {
    title: displayTitle,
    description,
    openGraph: {
      title: displayTitle,
      description,
      type: "article",
      authors: [note.author_name],
      publishedTime: note.created_at,
      modifiedTime: note.updated_at,
    },
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function NotePage({ params, searchParams }: Props) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const [note, user] = await Promise.all([getNote(id), getUser()]);

  if (!note) {
    notFound();
  }

  const isAuthor = user?.id === note.author_id;
  const backHref = from === "editor" && isAuthor ? `/n/${id}/edit` : "/";
  
  // Extract title from markdown content and get content without the title
  const { title: extractedTitle, contentWithoutTitle } = extractTitleFromMarkdown(note.content);
  const displayTitle = extractedTitle || note.title;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <article className="max-w-[680px] mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Back to notes"
            title="Back to notes"
            asChild
          >
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>

        <header className="mb-8">
          <h1 className="text-display text-[var(--text-primary)] mb-4">
            {displayTitle}
          </h1>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
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
              <div className="text-caption text-[var(--text-secondary)]">
                <span className="text-[var(--text-primary)] font-medium">
                  {note.author_name}
                </span>
                <span className="mx-2">·</span>
                <span>{formatDate(note.created_at)}</span>
                {isAuthor && note.visibility === "private" && (
                  <>
                    <span className="mx-2">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Lock className="size-3" />
                      Private
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <NotePageActions
                noteId={note.id}
                noteTitle={displayTitle}
                noteContent={note.content}
                isAuthor={isAuthor}
              />
            </div>
          </div>
          {note.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs rounded-[6px] bg-[var(--accent-subtle)] text-[var(--accent-subtle-foreground)]"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="border-b border-[var(--border)] mb-8" />

        <MarkdownRenderer content={contentWithoutTitle} />

        <Comments
          noteId={note.id}
          noteAuthorId={note.author_id}
          comments={note.comments}
          user={user}
        />
      </article>
    </main>
  );
}
