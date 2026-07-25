import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@arcanavtt/db-types";

/** Repository functions accept either the browser or server Supabase client. */
export type DbClient = SupabaseClient<Database>;
