"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[320px] text-center">
        <h1 className="text-display text-[var(--text-primary)] mb-2">md pockla</h1>
        <p className="text-body text-[var(--text-secondary)] mb-8">
          Share markdown notes with your team
        </p>
        <Button onClick={handleGoogleSignIn} className="w-full">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-[320px] text-center">
            <h1 className="text-display text-[var(--text-primary)] mb-2">md pockla</h1>
            <p className="text-body text-[var(--text-secondary)] mb-8">
              Share markdown notes with your team
            </p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
