import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@arcanavtt/db-types";

// Next.js 16 renamed the `middleware` file convention to `proxy` to clarify
// this always runs on the nodejs runtime (edge is not supported here).
// See: node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Refreshes the session cookie if the access token has expired. This is the
  // one place session refresh happens for Server Components, which cannot
  // write cookies themselves.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/projects") || pathname.startsWith("/admin");

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)"],
};
