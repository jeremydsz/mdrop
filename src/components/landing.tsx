import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-display text-[var(--text-primary)] mb-3">MDrop</h1>
        <p className="text-body text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
          A zero-friction markdown viewer. Paste, drop, or type markdown and get
          a shareable link in one click.
        </p>
        <Button asChild>
          <Link href="/login">Sign in with Google</Link>
        </Button>
      </div>
    </div>
  );
}
