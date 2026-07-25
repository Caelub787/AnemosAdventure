import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@arcanavtt/data-access/server";
import { searchRepo } from "@arcanavtt/data-access";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await searchRepo.searchProjectNodes(supabase, query);
  return NextResponse.json({ results });
}
