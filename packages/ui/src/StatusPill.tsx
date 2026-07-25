import { cn } from "./cn";

export type SyncStatusValue =
  | "saved"
  | "saving"
  | "offline"
  | "reconnecting"
  | "synchronizing"
  | "sync_failed"
  | "conflict";

interface StatusConfig {
  label: string;
  icon: string;
  className: string;
}

/**
 * Every state pairs an icon + label so meaning never depends on color alone
 * (color-independent status per the accessibility requirements).
 */
const statusConfig: Record<SyncStatusValue, StatusConfig> = {
  saved: { label: "Saved", icon: "✓", className: "text-emerald-400" },
  saving: { label: "Saving…", icon: "◌", className: "text-slate-300" },
  offline: { label: "Offline", icon: "⚠", className: "text-amber-400" },
  reconnecting: { label: "Reconnecting…", icon: "↻", className: "text-amber-400" },
  synchronizing: { label: "Synchronizing…", icon: "⇄", className: "text-sky-400" },
  sync_failed: { label: "Sync failed", icon: "✕", className: "text-red-400" },
  conflict: { label: "Conflict detected", icon: "‼", className: "text-red-400" },
};

export function StatusPill({ status, className }: { status: SyncStatusValue; className?: string }) {
  const config = statusConfig[status];
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-1.5 text-sm font-medium", config.className, className)}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
