import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@arcanavtt/data-access/server";

/**
 * Exchanges a Supabase auth code (email confirmation, password reset, magic
 * link) for a session cookie, then redirects onward. Referenced as the
 * `emailRedirectTo` / `redirectTo` target from the signup and reset-password
 * flows.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
