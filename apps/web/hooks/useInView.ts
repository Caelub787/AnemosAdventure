"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}

/** Reveals content once it scrolls into view. Skipped entirely under reduced motion. */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Under reduced motion the returned `inView` is already ORed with
    // `reducedMotion` below, so there's nothing to observe or set here.
    if (reducedMotion) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, options]);

  return { ref, inView: inView || reducedMotion, reducedMotion };
}
