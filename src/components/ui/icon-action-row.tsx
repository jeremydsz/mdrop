"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconActionRowProps = {
  children: ReactNode;
  className?: string;
  hoverReveal?: boolean;
};

export function IconActionRow({
  children,
  className,
  hoverReveal = false,
}: IconActionRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        hoverReveal &&
          "opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}
