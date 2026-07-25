import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArcanaVTT",
    short_name: "ArcanaVTT",
    description:
      "Build worlds, draw maps, and play tabletop RPGs together in one connected, real-time platform.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#4c1d95",
    orientation: "any",
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/icons/icon-maskable.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
