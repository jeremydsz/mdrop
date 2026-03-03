import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import type { Note, Tag } from "@/types/database";

type Props = {
  params: Promise<{ id: string }>;
};

async function getNote(
  id: string
): Promise<(Note & { tags: Tag[] }) | null> {
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

  return {
    ...note,
    tags,
  };
}

async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });
  return (tags as Tag[]) || [];
}

export default async function EditNotePage({ params }: Props) {
  const { id } = await params;
  const user = await requireAuth();
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  if (note.author_id !== user.id) {
    redirect(`/n/${id}`);
  }

  const existingTags = await getAllTags();

  return (
    <MarkdownEditor user={user} existingTags={existingTags} existingNote={note} />
  );
}
