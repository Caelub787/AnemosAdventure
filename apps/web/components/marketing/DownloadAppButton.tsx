"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function DownloadAppButton() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [showInstructions, setShowInstructions] = useState(false);

  async function handleClick() {
    if (canInstall) {
      await promptInstall();
      return;
    }
    setShowInstructions(true);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 hover:text-white"
      >
        Download App
      </button>
      {showInstructions && (
        <div
          role="dialog"
          aria-label="Install instructions"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs text-slate-300 shadow-lg"
        >
          <p>
            ArcanaVTT installs like an app. On desktop Chrome/Edge, use the install icon in the address bar. On
            iPhone/iPad Safari, use Share → Add to Home Screen.
          </p>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="mt-2 text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
