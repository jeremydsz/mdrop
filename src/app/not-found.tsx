import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-display text-[var(--text-primary)] mb-2">404</h1>
        <p className="text-body text-[var(--text-secondary)] mb-8">
          This note doesn&apos;t exist or has been deleted.
        </p>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
