export async function copyNoteLink(noteId: string): Promise<string> {
  const url = `${window.location.origin}/n/${noteId}`;
  await navigator.clipboard.writeText(url);
  return url;
}
