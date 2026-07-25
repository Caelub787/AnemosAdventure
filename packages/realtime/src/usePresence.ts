"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@arcanavtt/db-types";

export interface PresenceUser {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  color: string;
  cursor?: { x: number; y: number } | null;
}

const CURSOR_COLORS = ["#f97316", "#22d3ee", "#a855f7", "#facc15", "#4ade80", "#f472b6", "#60a5fa"];

function colorForUser(userId: string) {
  let hash = 0;
  for (const char of userId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return CURSOR_COLORS[hash % CURSOR_COLORS.length] ?? "#a78bfa";
}

/**
 * Joins a Supabase Realtime Presence channel and tracks who else is present.
 * Used for project/map/campaign "who's online" lists and live cursors —
 * shared across World Builder, Map Maker, and campaign lobby.
 */
export function usePresence(
  client: SupabaseClient<Database>,
  channelName: string,
  self: { userId: string; displayName: string; avatarUrl?: string | null }
) {
  const [others, setOthers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<ReturnType<SupabaseClient<Database>["channel"]> | null>(null);

  useEffect(() => {
    const channel = client.channel(channelName, {
      config: { presence: { key: self.userId } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users = Object.values(state)
          .flat()
          .filter((presence) => presence.userId !== self.userId);
        setOthers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId: self.userId,
            displayName: self.displayName,
            avatarUrl: self.avatarUrl,
            color: colorForUser(self.userId),
            cursor: null,
          } satisfies PresenceUser);
        }
      });

    return () => {
      client.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, channelName, self.userId]);

  function updateCursor(cursor: { x: number; y: number } | null) {
    channelRef.current?.track({
      userId: self.userId,
      displayName: self.displayName,
      avatarUrl: self.avatarUrl,
      color: colorForUser(self.userId),
      cursor,
    } satisfies PresenceUser);
  }

  return { others, updateCursor };
}
