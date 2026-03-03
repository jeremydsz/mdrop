import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import type { Tag } from "@/types/database";

async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });
  return (tags as Tag[]) || [];
}

export default async function NewNotePage() {
  const user = await requireAuth();
  const existingTags = await getAllTags();

  return <MarkdownEditor user={user} existingTags={existingTags} />;
}
