import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@arcanavtt/data-access/server";

/**
 * Fast-fail app-layer check for Server Components. proxy.ts already redirects
 * unauthenticated requests away from protected routes; this is defense in
 * depth so a page never renders even a flash of protected UI.
 */
export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}
