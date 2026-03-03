const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;
const FALLBACK_FILENAME = "untitled-note";

export function sanitizeFilename(title: string): string {
  return title.trim().replace(INVALID_FILENAME_CHARS, "-").replace(/-{2,}/g, "-");
}

export function buildMarkdownFilename(title?: string): string {
  if (!title?.trim()) return `${FALLBACK_FILENAME}.md`;
  return `${sanitizeFilename(title)}.md`;
}

export function downloadMarkdownNote(content: string, title?: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = buildMarkdownFilename(title);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
