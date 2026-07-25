"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useYDoc, usePresence, useSyncStatusStore } from "@arcanavtt/realtime";
import { createClient } from "@arcanavtt/data-access/client";
import { mapsRepo } from "@arcanavtt/data-access";
import type { MapObjectType } from "@arcanavtt/db-types";
import { StatusPill } from "@arcanavtt/ui";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { PresenceAvatars } from "@/components/presence/PresenceAvatars";

interface MapObjectData {
  id: string;
  objectType: MapObjectType;
  x: number;
  y: number;
  label: string;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

export function MapCanvas({
  projectId,
  mapId,
  initialObjects,
}: {
  projectId: string;
  mapId: string;
  initialObjects: MapObjectData[];
}) {
  const { user, accessToken } = useSupabaseAuth();
  const status = useSyncStatusStore((s) => s.status);
  const setMutationPending = useSyncStatusStore((s) => s.setMutationPending);
  const setMutationFailed = useSyncStatusStore((s) => s.setMutationFailed);

  const { doc, provider } = useYDoc({ docName: `map:${mapId}`, token: accessToken ?? "" });
  const yObjects = useMemo(() => doc.getMap<MapObjectData>("objects"), [doc]);

  const supabase = createClient();
  const { others, updateCursor } = usePresence(supabase, `map:${mapId}:presence`, {
    userId: user?.id ?? "anonymous",
    displayName: user?.user_metadata?.display_name ?? user?.email ?? "Someone",
  });

  const [objects, setObjects] = useState<MapObjectData[]>(initialObjects);
  const [placing, setPlacing] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const pinchState = useRef<{ distance: number; zoom: number } | null>(null);
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Seed the shared Yjs map from Postgres on first connection (Hocuspocus doc starts empty).
  useEffect(() => {
    if (!provider) return;
    const seedOnce = () => {
      if (yObjects.size === 0 && initialObjects.length > 0) {
        doc.transact(() => {
          for (const object of initialObjects) yObjects.set(object.id, object);
        });
      }
    };
    provider.on("synced", seedOnce);
    return () => {
      provider.off("synced", seedOnce);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, yObjects]);

  useEffect(() => {
    const handleChange = () => setObjects([...yObjects.values()]);
    yObjects.observe(handleChange);
    handleChange();
    return () => yObjects.unobserve(handleChange);
  }, [yObjects]);

  function persistObject(object: MapObjectData) {
    const timers = saveTimers.current;
    const existing = timers.get(object.id);
    if (existing) clearTimeout(existing);

    setMutationPending(true);
    timers.set(
      object.id,
      setTimeout(async () => {
        try {
          await mapsRepo.upsertMapObject(supabase, {
            id: object.id,
            mapId,
            objectType: object.objectType,
            x: object.x,
            y: object.y,
            data: { label: object.label },
            createdBy: user?.id ?? "",
          });
          setMutationPending(false);
        } catch (error) {
          console.error(error);
          setMutationFailed();
        }
      }, 600)
    );
  }

  function worldPointFromEvent(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (placing || (event.target as HTMLElement).dataset.marker) return;
    dragState.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
  }

  function handlePointerMove(event: React.PointerEvent) {
    const point = worldPointFromEvent(event.clientX, event.clientY);
    updateCursor(point);

    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - event.deltaY * 0.001)));
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (event.touches.length === 2) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchState.current = { distance, zoom };
    }
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (event.touches.length === 2 && pinchState.current) {
      const [a, b] = [event.touches[0], event.touches[1]];
      const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const scale = distance / pinchState.current.distance;
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchState.current.zoom * scale)));
    }
  }

  function handleTouchEnd() {
    pinchState.current = null;
  }

  function handleCanvasClick(event: React.MouseEvent) {
    if (!placing) return;
    const point = worldPointFromEvent(event.clientX, event.clientY);
    const label = window.prompt("Label for this marker?") ?? "Marker";
    const object: MapObjectData = { id: crypto.randomUUID(), objectType: "marker", x: point.x, y: point.y, label };

    yObjects.set(object.id, object);
    persistObject(object);
    setPlacing(false);
  }

  function moveObject(id: string, x: number, y: number) {
    const current = yObjects.get(id);
    if (!current) return;
    const updated = { ...current, x, y };
    yObjects.set(id, updated);
    persistObject(updated);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${projectId}/maps`} className="text-sm text-slate-400 hover:text-slate-200">
            ← Maps
          </Link>
          <button
            type="button"
            onClick={() => setPlacing((v) => !v)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              placing ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-100 hover:bg-slate-700"
            }`}
          >
            {placing ? "Click the map to place…" : "Add marker"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <PresenceAvatars users={others} />
          <StatusPill status={status} />
        </div>
      </div>

      <div
        ref={containerRef}
        role="application"
        aria-label="Map canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCanvasClick}
        className="relative h-[65vh] touch-none overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)",
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor: placing ? "crosshair" : "grab",
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {objects.map((object) => (
            <button
              key={object.id}
              type="button"
              data-marker="true"
              title={object.label}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: object.x, top: object.y }}
              draggable
              onDragEnd={(event) => {
                const point = worldPointFromEvent(event.clientX, event.clientY);
                moveObject(object.id, point.x, point.y);
              }}
            >
              <span className="h-3 w-3 rounded-full bg-amber-400 shadow" />
              <span className="mt-1 whitespace-nowrap rounded bg-slate-900/90 px-1.5 py-0.5 text-xs text-slate-100">
                {object.label}
              </span>
            </button>
          ))}

          {others
            .filter((presence) => presence.cursor)
            .map((presence) => (
              <div
                key={presence.userId}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: presence.cursor!.x, top: presence.cursor!.y }}
              >
                <div className="h-3 w-3 rotate-45" style={{ backgroundColor: presence.color }} />
                <span className="whitespace-nowrap rounded px-1 text-xs text-white" style={{ backgroundColor: presence.color }}>
                  {presence.displayName}
                </span>
              </div>
            ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">Drag to pan, scroll or pinch to zoom, drag a marker to move it.</p>
    </div>
  );
}
