"use client";

import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { Button } from "@arcanavtt/ui";

export function ServiceWorkerUpdateToast() {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-lg sm:inset-x-auto sm:right-4"
    >
      <p className="text-sm">A new version of ArcanaVTT is ready.</p>
      <Button size="sm" onClick={applyUpdate}>
        Update now
      </Button>
    </div>
  );
}
