import type { PresenceUser } from "@arcanavtt/realtime";

export function PresenceAvatars({ users }: { users: PresenceUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex -space-x-2" aria-label={`${users.length} other people viewing`}>
      {users.map((user) => (
        <span
          key={user.userId}
          title={user.displayName}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-950 text-xs font-medium text-white"
          style={{ backgroundColor: user.color }}
        >
          {user.displayName.slice(0, 1).toUpperCase()}
        </span>
      ))}
    </div>
  );
}
