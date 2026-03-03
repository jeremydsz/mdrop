"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";
import { groupCommands, type SlashCommand } from "./slash-commands";

type SlashCommandMenuProps = {
  commands: SlashCommand[];
  activeIndex: number;
  position: { top: number; left: number } | null;
  onSelect: (command: SlashCommand) => void;
  onHover: (index: number) => void;
};

export function SlashCommandMenu({
  commands,
  activeIndex,
  position,
  onSelect,
  onHover,
}: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const isOpen = position !== null;

  useEffect(() => {
    const el = itemRefs.current.get(activeIndex);
    if (el && menuRef.current) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex]);

  const groups = groupCommands(commands);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && position && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={transitions.smooth}
          role="listbox"
          aria-label="Slash commands"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-50 w-60 max-h-80 overflow-y-auto rounded-[10px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] py-1.5"
          style={{
            top: position.top,
            left: Math.max(position.left, 0),
          }}
        >
          {commands.length === 0 ? (
            <div className="px-3 py-6 text-center text-caption text-[var(--text-tertiary)]">
              No commands found
            </div>
          ) : (
            groups.map(([category, cmds]) => (
              <div key={category} role="group" aria-label={category}>
                <div className="px-3 py-1.5 text-caption text-[var(--text-tertiary)] select-none">
                  {category}
                </div>
                {cmds.map((cmd) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={cmd.id}
                      ref={(el) => {
                        if (el) itemRefs.current.set(idx, el);
                        else itemRefs.current.delete(idx);
                      }}
                      role="option"
                      aria-selected={isActive}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-1.5 text-left text-body transition-colors",
                        isActive
                          ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                          : "text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
                      )}
                      onClick={() => onSelect(cmd)}
                      onMouseEnter={() => onHover(idx)}
                    >
                      <cmd.icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive
                            ? "text-[var(--accent)]"
                            : "text-[var(--text-secondary)]"
                        )}
                      />
                      <span className="truncate">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
