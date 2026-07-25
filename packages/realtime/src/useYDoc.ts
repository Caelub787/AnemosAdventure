"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { IndexeddbPersistence } from "y-indexeddb";
import type { Awareness } from "y-protocols/awareness";
import { useSyncStatusStore } from "./syncStatusStore";

export interface UseYDocOptions {
  /** Stable document name, e.g. `entry:{entryId}` or `map:{mapId}`. */
  docName: string;
  /** Supabase access token used to authenticate the WebSocket connection. */
  token: string;
}

/**
 * Connects to the shared Hocuspocus realtime-sync server for a given
 * CRDT document, with IndexedDB-backed offline persistence. Backs both
 * the World Builder editor and the Map Maker canvas so they share one
 * collaboration implementation instead of two.
 */
export function useYDoc({ docName, token }: UseYDocOptions): {
  doc: Y.Doc;
  provider: HocuspocusProvider | null;
  awareness: Awareness | null;
} {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_HOCUSPOCUS_URL;
    if (!url) {
      console.warn("NEXT_PUBLIC_HOCUSPOCUS_URL is not set; realtime collaboration is disabled.");
      return;
    }

    const setProviderStatus = useSyncStatusStore.getState().setProviderStatus;
    const setSynced = useSyncStatusStore.getState().setSynced;

    const indexeddbPersistence = new IndexeddbPersistence(docName, doc);
    persistenceRef.current = indexeddbPersistence;

    const hocuspocusProvider = new HocuspocusProvider({
      url,
      name: docName,
      document: doc,
      token,
      onStatus: ({ status }) => {
        setProviderStatus(status === "connected" ? "connected" : "connecting");
      },
      onDisconnect: () => setProviderStatus("disconnected"),
      onSynced: ({ state }) => setSynced(state),
    });

    setProvider(hocuspocusProvider);

    return () => {
      hocuspocusProvider.destroy();
      indexeddbPersistence.destroy();
      setProvider(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docName, token]);

  return { doc, provider, awareness: provider?.awareness ?? null };
}
