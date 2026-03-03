import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Code,
  SquareCode,
  Quote,
  Minus,
  List,
  ListOrdered,
  ListChecks,
  Link,
  Image,
  Table,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SlashCommand = {
  id: string;
  label: string;
  keywords: string[];
  category: string;
  icon: LucideIcon;
  insert: string;
  cursorOffset?: number;
  selectRange?: [number, number];
};

export const slashCommands: SlashCommand[] = [
  {
    id: "h1",
    label: "Heading 1",
    keywords: ["h1", "heading", "title", "header"],
    category: "Headings",
    icon: Heading1,
    insert: "# ",
  },
  {
    id: "h2",
    label: "Heading 2",
    keywords: ["h2", "heading", "subtitle", "header"],
    category: "Headings",
    icon: Heading2,
    insert: "## ",
  },
  {
    id: "h3",
    label: "Heading 3",
    keywords: ["h3", "heading", "header"],
    category: "Headings",
    icon: Heading3,
    insert: "### ",
  },
  {
    id: "bold",
    label: "Bold",
    keywords: ["bold", "strong", "b"],
    category: "Formatting",
    icon: Bold,
    insert: "**bold text**",
    selectRange: [2, 9],
  },
  {
    id: "italic",
    label: "Italic",
    keywords: ["italic", "emphasis", "em", "i"],
    category: "Formatting",
    icon: Italic,
    insert: "*italic text*",
    selectRange: [1, 11],
  },
  {
    id: "strikethrough",
    label: "Strikethrough",
    keywords: ["strikethrough", "strike", "del", "s"],
    category: "Formatting",
    icon: Strikethrough,
    insert: "~~strikethrough~~",
    selectRange: [2, 13],
  },
  {
    id: "inline-code",
    label: "Inline Code",
    keywords: ["code", "inline", "mono"],
    category: "Formatting",
    icon: Code,
    insert: "`code`",
    selectRange: [1, 4],
  },
  {
    id: "code-block",
    label: "Code Block",
    keywords: ["code", "block", "fence", "pre"],
    category: "Blocks",
    icon: SquareCode,
    insert: "```\n\n```",
    cursorOffset: -4,
  },
  {
    id: "blockquote",
    label: "Blockquote",
    keywords: ["quote", "blockquote", "cite"],
    category: "Blocks",
    icon: Quote,
    insert: "> ",
  },
  {
    id: "horizontal-rule",
    label: "Horizontal Rule",
    keywords: ["rule", "divider", "line", "hr", "separator"],
    category: "Blocks",
    icon: Minus,
    insert: "---\n",
  },
  {
    id: "bullet-list",
    label: "Bullet List",
    keywords: ["bullet", "unordered", "list", "ul"],
    category: "Lists",
    icon: List,
    insert: "- ",
  },
  {
    id: "numbered-list",
    label: "Numbered List",
    keywords: ["numbered", "ordered", "list", "ol"],
    category: "Lists",
    icon: ListOrdered,
    insert: "1. ",
  },
  {
    id: "task-list",
    label: "Task List",
    keywords: ["task", "todo", "checkbox", "check"],
    category: "Lists",
    icon: ListChecks,
    insert: "- [ ] ",
  },
  {
    id: "link",
    label: "Link",
    keywords: ["link", "url", "href", "anchor"],
    category: "Media",
    icon: Link,
    insert: "[link text](url)",
    selectRange: [1, 9],
  },
  {
    id: "image",
    label: "Image",
    keywords: ["image", "img", "picture", "photo"],
    category: "Media",
    icon: Image,
    insert: "![alt text](url)",
    selectRange: [2, 8],
  },
  {
    id: "table",
    label: "Table",
    keywords: ["table", "grid", "columns"],
    category: "Media",
    icon: Table,
    insert:
      "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n",
  },
];

export function filterCommands(query: string): SlashCommand[] {
  if (!query) return slashCommands;
  const lower = query.toLowerCase();
  return slashCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(lower) ||
      cmd.id.includes(lower) ||
      cmd.keywords.some((kw) => kw.includes(lower))
  );
}

export function groupCommands(
  commands: SlashCommand[]
): [string, SlashCommand[]][] {
  const map = new Map<string, SlashCommand[]>();
  for (const cmd of commands) {
    const group = map.get(cmd.category) || [];
    group.push(cmd);
    map.set(cmd.category, group);
  }
  return Array.from(map.entries());
}
