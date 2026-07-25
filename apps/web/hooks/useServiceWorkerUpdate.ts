"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Surfaces a non-disruptive "update available" signal for the PWA service
 * worker (Serwist-generated). Never force-reloads — the caller decides when
 * to call applyUpdate(), so an in-progress VTT session or document edit is
 * never interrupted by an update.
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const handleUpdateFound = () => {
      const installing = registration?.installing;
      if (!installing) return;

      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          waitingWorkerRef.current = installing;
          setUpdateAvailable(true);
        }
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      registration = reg;
      if (!registration) return;

      if (registration.waiting && navigator.serviceWorker.controller) {
        waitingWorkerRef.current = registration.waiting;
        setUpdateAvailable(true);
      }

      registration.addEventListener("updatefound", handleUpdateFound);
    });

    return () => {
      registration?.removeEventListener("updatefound", handleUpdateFound);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    const waiting = waitingWorkerRef.current;
    if (!waiting) return;

    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), {
      once: true,
    });
    waiting.postMessage({ type: "SKIP_WAITING" });
  }, []);

  return { updateAvailable, applyUpdate };
}
