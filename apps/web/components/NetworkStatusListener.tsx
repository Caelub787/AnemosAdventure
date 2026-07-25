"use client";

import { useEffect } from "react";
import { initNetworkListeners } from "@arcanavtt/realtime";

/** Wires window online/offline events into the shared sync-status store once per app load. */
export function NetworkStatusListener() {
  useEffect(() => initNetworkListeners(), []);
  return null;
}
