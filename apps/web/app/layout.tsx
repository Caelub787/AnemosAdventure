import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NetworkStatusListener } from "@/components/NetworkStatusListener";
import { ServiceWorkerUpdateToast } from "@/components/ServiceWorkerUpdateToast";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ArcanaVTT",
    template: "%s · ArcanaVTT",
  },
  description:
    "Build worlds, draw maps, and play tabletop RPGs together in one connected, real-time platform.",
};

export const viewport: Viewport = {
  themeColor: "#4c1d95",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
        <NetworkStatusListener />
        <RegisterServiceWorker />
        <ServiceWorkerUpdateToast />
      </body>
    </html>
  );
}
