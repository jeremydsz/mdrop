import type { SlashCommand } from "@/components/editor/slash-commands";

export type InsertionResult = {
  newContent: string;
  cursorPos: number;
  selectStart?: number;
  selectEnd?: number;
};

export function insertSlashCommand(
  content: string,
  slashStart: number,
  slashEnd: number,
  command: SlashCommand
): InsertionResult {
  const before = content.substring(0, slashStart);
  const after = content.substring(slashEnd);
  const newContent = before + command.insert + after;
  const insertEnd = slashStart + command.insert.length;

  if (command.selectRange) {
    const [offset, length] = command.selectRange;
    return {
      newContent,
      cursorPos: insertEnd,
      selectStart: slashStart + offset,
      selectEnd: slashStart + offset + length,
    };
  }

  const cursorPos =
    command.cursorOffset !== undefined
      ? insertEnd + command.cursorOffset
      : insertEnd;

  return { newContent, cursorPos };
}

const MIRROR_STYLE_PROPS = [
  "direction",
  "boxSizing",
  "width",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "textTransform",
  "wordSpacing",
  "textIndent",
  "tabSize",
] as const;

/**
 * Computes pixel coordinates of a caret position within a textarea
 * using a hidden mirror div with matching styles.
 */
export function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): { top: number; left: number; lineHeight: number } {
  const div = document.createElement("div");
  const computed = getComputedStyle(textarea);

  div.style.position = "absolute";
  div.style.top = "0";
  div.style.left = "0";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordWrap = "break-word";
  div.style.overflow = "hidden";

  for (const prop of MIRROR_STYLE_PROPS) {
    const kebab = prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    div.style.setProperty(kebab, computed.getPropertyValue(kebab));
  }

  div.textContent = textarea.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = textarea.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);

  const lineHeight =
    parseInt(computed.lineHeight, 10) ||
    Math.round(parseFloat(computed.fontSize) * 1.2);

  const coords = {
    top: span.offsetTop - textarea.scrollTop,
    left: span.offsetLeft - textarea.scrollLeft,
    lineHeight,
  };

  document.body.removeChild(div);
  return coords;
}

/**
 * Extracts the title from the first heading line of markdown content.
 * Returns the title and the content with the first heading removed.
 */
export function extractTitleFromMarkdown(content: string): {
  title: string | null;
  contentWithoutTitle: string;
} {
  const lines = content.split("\n");
  
  // Find the first non-empty line
  let firstContentLineIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== "") {
      firstContentLineIndex = i;
      break;
    }
  }
  
  if (firstContentLineIndex === -1) {
    return { title: null, contentWithoutTitle: content };
  }
  
  const firstLine = lines[firstContentLineIndex];
  
  // Check if the first non-empty line is a markdown heading (# Title)
  const headingMatch = firstLine.match(/^#+\s+(.+)$/);
  
  if (!headingMatch) {
    return { title: null, contentWithoutTitle: content };
  }
  
  const title = headingMatch[1].trim().replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/_(.+?)_/g, '$1');
  
  // Remove the title line and any immediately following empty lines
  const remainingLines = lines.slice(firstContentLineIndex + 1);
  
  // Skip leading empty lines after the title
  let startIndex = 0;
  while (startIndex < remainingLines.length && remainingLines[startIndex].trim() === "") {
    startIndex++;
  }
  
  const contentWithoutTitle = remainingLines.slice(startIndex).join("\n");
  
  return { title, contentWithoutTitle };
}
