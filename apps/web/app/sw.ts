import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, ExpirationPlugin } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
      handler: new NetworkFirst({
        cacheName: "supabase-rest",
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 5 })],
      }),
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: new CacheFirst({
        cacheName: "static-images",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 })],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
