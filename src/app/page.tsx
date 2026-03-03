import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard";
import { Landing } from "@/components/landing";
import { extractTitleFromMarkdown } from "@/lib/markdown";
import type { Note, NoteWithDisplayTitle, Tag } from "@/types/database";

async function getNotes(userId: string): Promise<NoteWithDisplayTitle[]> {
  const supabase = await createClient();

  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error || !notes) {
    return [];
  }

  const noteIds = (notes as Note[]).map((n) => n.id);
  const { data: noteTags } = await supabase
    .from("note_tags")
    .select("*")
    .in("note_id", noteIds);
  const { data: tags } = await supabase.from("tags").select("*");

  const tagsMap = new Map((tags as Tag[])?.map((t) => [t.id, t]) || []);

  return (notes as Note[]).map((note) => {
    const { title: extractedTitle } = extractTitleFromMarkdown(note.content);
    return {
      ...note,
      displayTitle: extractedTitle || note.title,
      tags:
        (noteTags as { note_id: string; tag_id: string }[])
          ?.filter((nt) => nt.note_id === note.id)
          .map((nt) => tagsMap.get(nt.tag_id))
          .filter((t): t is Tag => t !== undefined) || [],
    };
  });
}

async function getUserTags(userId: string): Promise<Tag[]> {
  const supabase = await createClient();
  const { data: noteTags } = await supabase
    .from("note_tags")
    .select("tag_id, notes!inner(author_id)")
    .eq("notes.author_id", userId);

  if (!noteTags || noteTags.length === 0) return [];

  const tagIds = [...new Set((noteTags as { tag_id: string }[]).map((nt) => nt.tag_id))];
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .in("id", tagIds)
    .order("name", { ascending: true });

  return (tags as Tag[]) || [];
}

export default async function HomePage() {
  const user = await getUser();

  if (!user) {
    return <Landing />;
  }

  const [notes, tags] = await Promise.all([getNotes(user.id), getUserTags(user.id)]);

  return <Dashboard user={user} notes={notes} tags={tags} />;
}
