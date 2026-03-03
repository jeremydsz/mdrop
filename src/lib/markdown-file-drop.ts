const MARKDOWN_EXTENSION = ".md";
const STAGED_MARKDOWN_IMPORT_KEY = "mdrop:staged-markdown-import";

export interface StagedMarkdownImport {
  content: string;
  fileName: string;
  createdAt: number;
}

export function hasFilePayload(dataTransfer: DataTransfer | null): boolean {
  if (!dataTransfer) return false;
  return Array.from(dataTransfer.types).includes("Files");
}

export function findMarkdownFile(dataTransfer: DataTransfer | null): File | null {
  if (!dataTransfer) return null;

  return (
    Array.from(dataTransfer.files).find((file) =>
      file.name.toLowerCase().endsWith(MARKDOWN_EXTENSION)
    ) || null
  );
}

export async function readFileAsText(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve((event.target?.result as string) || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function stageMarkdownImport(payload: StagedMarkdownImport): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    STAGED_MARKDOWN_IMPORT_KEY,
    JSON.stringify(payload)
  );
}

export function hasStagedMarkdownImport(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STAGED_MARKDOWN_IMPORT_KEY) !== null;
}

export function consumeStagedMarkdownImport(): StagedMarkdownImport | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STAGED_MARKDOWN_IMPORT_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(STAGED_MARKDOWN_IMPORT_KEY);

  try {
    const parsed = JSON.parse(raw) as Partial<StagedMarkdownImport>;
    if (typeof parsed.content !== "string") return null;

    return {
      content: parsed.content,
      fileName:
        typeof parsed.fileName === "string" && parsed.fileName.length > 0
          ? parsed.fileName
          : "imported.md",
      createdAt:
        typeof parsed.createdAt === "number" ? parsed.createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}
