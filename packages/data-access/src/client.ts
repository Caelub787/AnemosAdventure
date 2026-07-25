"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@arcanavtt/db-types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Singleton browser client. Safe to call from any client component;
 * only ever reads the public URL + anon key, both safe to ship to the client.
 */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}
