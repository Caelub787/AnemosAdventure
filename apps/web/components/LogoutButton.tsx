"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { Button } from "@arcanavtt/ui";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Log out
    </Button>
  );
}
