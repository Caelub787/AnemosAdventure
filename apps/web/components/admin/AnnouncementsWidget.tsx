"use client";

import { useEffect, useState } from "react";
import { createClient } from "@arcanavtt/data-access/client";
import { Card } from "@arcanavtt/ui";

interface Announcement {
  id: string;
  title: string;
  status: string;
}

/**
 * Subscribes to Postgres Changes on content_items so a newly published
 * announcement appears here immediately, with no redeploy and no page
 * refresh — the concrete proof that admin content updates are live.
 */
export function AnnouncementsWidget({ initial }: { initial: Announcement[] }) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("public:content_items")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content_items" },
        (payload) => {
          const row = (payload.new ?? payload.old) as Announcement & { status: string };
          setItems((current) => {
            const withoutRow = current.filter((item) => item.id !== row.id);
            if (payload.eventType !== "DELETE" && row.status === "published") {
              return [{ id: row.id, title: row.title, status: row.status }, ...withoutRow];
            }
            return withoutRow;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-white">Announcements</h2>
      <div className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <Card key={item.id}>
            <p className="text-sm text-slate-200">{item.title}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
