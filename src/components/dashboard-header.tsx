"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuickStartGuideDialog } from "@/components/quick-start-guide-dialog";
import { Compass, LogOut } from "lucide-react";

type DashboardHeaderProps = {
  user: {
    name: string;
    image: string | null;
  };
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);

  const handleQuickStartGuide = () => {
    setIsQuickStartOpen(true);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-[var(--border)]">
      <h1 className="text-heading font-semibold text-[var(--text-primary)]">
        MDrop
      </h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus:outline-none">
            <Avatar>
              <AvatarImage src={user.image || undefined} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleQuickStartGuide}>
            <Compass className="mr-2 size-4" />
            Quick start guide
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <QuickStartGuideDialog
        open={isQuickStartOpen}
        onOpenChange={setIsQuickStartOpen}
      />
    </header>
  );
}
