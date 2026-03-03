"use client";

import { cn } from "@/lib/utils";
import type { Tag } from "@/types/database";

type TagFilterProps = {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
};

export function TagFilter({ tags, selectedTags, onTagToggle }: TagFilterProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-[6px] whitespace-nowrap transition-colors",
              isSelected
                ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                : "bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]"
            )}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
