"use client";

import { create } from "zustand";
import type { SyncStatusValue } from "@arcanavtt/ui";

interface SyncStatusState {
  online: boolean;
  providerStatus: "connected" | "connecting" | "disconnected";
  synced: boolean;
  mutationPending: boolean;
  conflict: boolean;
  status: SyncStatusValue;
  setOnline: (online: boolean) => void;
  setProviderStatus: (status: SyncStatusState["providerStatus"]) => void;
  setSynced: (synced: boolean) => void;
  setMutationPending: (pending: boolean) => void;
  setMutationFailed: () => void;
  setConflict: (conflict: boolean) => void;
}

function computeStatus(state: Omit<SyncStatusState, "status" | keyof Actions>): SyncStatusValue {
  if (state.conflict) return "conflict";
  if (!state.online) return "offline";
  if (state.providerStatus === "connecting") return "reconnecting";
  if (state.mutationPending) return "saving";
  if (state.providerStatus === "connected" && !state.synced) return "synchronizing";
  return "saved";
}

type Actions = Pick<
  SyncStatusState,
  "setOnline" | "setProviderStatus" | "setSynced" | "setMutationPending" | "setMutationFailed" | "setConflict"
>;

export const useSyncStatusStore = create<SyncStatusState>((set, get) => ({
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  providerStatus: "connecting",
  synced: false,
  mutationPending: false,
  conflict: false,
  status: "synchronizing",

  setOnline: (online) => set((s) => ({ online, status: computeStatus({ ...s, online }) })),
  setProviderStatus: (providerStatus) =>
    set((s) => ({ providerStatus, status: computeStatus({ ...s, providerStatus }) })),
  setSynced: (synced) => set((s) => ({ synced, status: computeStatus({ ...s, synced }) })),
  setMutationPending: (mutationPending) =>
    set((s) => ({ mutationPending, status: computeStatus({ ...s, mutationPending }) })),
  setMutationFailed: () => set({ status: "sync_failed" }),
  setConflict: (conflict) => set((s) => ({ conflict, status: computeStatus({ ...s, conflict }) })),
}));

/** Wires navigator online/offline events into the store. Call once from a root client component. */
export function initNetworkListeners() {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => useSyncStatusStore.getState().setOnline(true);
  const handleOffline = () => useSyncStatusStore.getState().setOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
