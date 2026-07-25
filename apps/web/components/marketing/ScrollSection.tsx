"use client";

import type { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@arcanavtt/ui";

export function ScrollSection({
  eyebrow,
  title,
  description,
  children,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  align?: "left" | "right";
}) {
  const { ref, inView, reducedMotion } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className="flex min-h-[80vh] snap-start items-center border-b border-slate-900 px-6 py-16 sm:px-12"
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 sm:grid-cols-2",
          align === "right" && "sm:[&>*:first-child]:order-2"
        )}
      >
        <div
          className={cn(
            !reducedMotion && "transition-all duration-700 ease-out",
            !reducedMotion && (inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")
          )}
        >
          <p className="text-sm font-medium uppercase tracking-wide text-violet-400">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-md text-slate-400">{description}</p>
        </div>
        <div
          className={cn(
            "flex aspect-video items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60",
            !reducedMotion && "transition-all delay-150 duration-700 ease-out",
            !reducedMotion && (inView ? "scale-100 opacity-100" : "scale-95 opacity-0")
          )}
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
