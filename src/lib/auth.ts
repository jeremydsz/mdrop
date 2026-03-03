import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.full_name || user.user_metadata?.name || "User",
    image: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
