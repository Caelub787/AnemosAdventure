import "server-only";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@arcanavtt/db-types";

/**
 * Server Component / Route Handler / Server Action client. Reads and writes
 * the auth cookie via next/headers, so the caller must be inside a request
 * scope (Next.js 16 `cookies()` is async).
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // setAll is called from a Server Component render in some cases;
        // the session is still refreshed by proxy.ts on the next request.
      }
    },
  };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );
}

/**
 * Service-role client. Bypasses RLS entirely — only use for trusted,
 * server-only operations (admin bootstrap scripts, background jobs).
 * Never import this from client code or expose the key to the browser.
 */
export function createAdminSupabaseClient() {
  return createRawClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
