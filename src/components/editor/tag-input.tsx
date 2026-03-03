"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldContainerClass } from "@/components/ui/field-styles";
import type { Tag } from "@/types/database";

type TagInputProps = {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  existingTags: Tag[];
  maxTags?: number;
};

export function TagInput({
  tags,
  onTagsChange,
  existingTags,
  maxTags = 5,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeTagName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30);
  };

  const filteredSuggestions = existingTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(tag.name)
  );

  const handleAddTag = (tagName: string) => {
    const normalized = normalizeTagName(tagName);
    if (normalized && !tags.includes(normalized) && tags.length < maxTags) {
      onTagsChange([...tags, normalized]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(tags.filter((t) => t !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue.trim());
      }
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <div
        className={cn(
          fieldContainerClass,
          "flex min-h-[42px] flex-wrap gap-2 p-2"
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--accent-subtle)] px-2 py-0.5 text-caption text-[var(--accent)]"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="hover:bg-[var(--accent)]/10 rounded-full p-0.5"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            className="flex-1 min-w-[100px] bg-transparent text-body outline-none placeholder:text-[var(--text-tertiary)]"
          />
        )}
      </div>

      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 py-1 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
          {filteredSuggestions.slice(0, 5).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleAddTag(tag.name)}
              className="w-full px-3 py-1.5 text-left text-body text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-caption text-[var(--text-tertiary)] mt-1">
          Maximum {maxTags} tags
        </p>
      )}
    </div>
  );
}
