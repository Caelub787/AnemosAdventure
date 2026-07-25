"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { useYDoc, usePresence, useSyncStatusStore } from "@arcanavtt/realtime";
import { createClient } from "@arcanavtt/data-access/client";
import { entriesRepo } from "@arcanavtt/data-access";
import { StatusPill } from "@arcanavtt/ui";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { PresenceAvatars } from "@/components/presence/PresenceAvatars";

const WIKI_LINK_PATTERN = /\[\[([^\]]+)\]\]/g;

export function WorldEntryEditor({
  projectId,
  entryId,
  initialTitle,
}: {
  projectId: string;
  entryId: string;
  initialTitle: string;
}) {
  const { user, accessToken } = useSupabaseAuth();
  const [title, setTitle] = useState(initialTitle);
  const status = useSyncStatusStore((s) => s.status);
  const setMutationPending = useSyncStatusStore((s) => s.setMutationPending);
  const setMutationFailed = useSyncStatusStore((s) => s.setMutationFailed);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { doc, provider } = useYDoc({ docName: `entry:${entryId}`, token: accessToken ?? "" });

  const supabase = createClient();
  const { others } = usePresence(supabase, `project:${projectId}:entry:${entryId}`, {
    userId: user?.id ?? "anonymous",
    displayName: user?.user_metadata?.display_name ?? user?.email ?? "Someone",
  });

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ history: false }),
        Collaboration.configure({ document: doc }),
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider,
                user: {
                  name: user?.user_metadata?.display_name ?? user?.email ?? "Someone",
                  color: "#a78bfa",
                },
              }),
            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class: "prose prose-invert max-w-none focus:outline-none min-h-[50vh] px-4 py-3",
        },
      },
      onUpdate: scheduleSave,
    },
    [doc, provider]
  );

  function scheduleSave() {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setMutationPending(true);
    saveTimeout.current = setTimeout(async () => {
      await persist();
    }, 800);
  }

  async function persist() {
    if (!editor) return;
    try {
      const contentText = editor.getText();
      await entriesRepo.updateWorldEntry(supabase, entryId, { title, contentText });

      const linkTitles = [...contentText.matchAll(WIKI_LINK_PATTERN)].map((match) => match[1].trim());
      const uniqueTitles = [...new Set(linkTitles)];
      const targets = await entriesRepo.resolveLinkTargets(supabase, projectId, uniqueTitles);

      await entriesRepo.replaceEntryLinks(supabase, {
        projectId,
        sourceEntryId: entryId,
        links: uniqueTitles.map((linkText) => ({ linkText, targetNodeId: targets.get(linkText) ?? null })),
      });

      setMutationPending(false);
    } catch (error) {
      console.error(error);
      setMutationFailed();
    }
  }

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            scheduleSave();
          }}
          aria-label="Entry title"
          className="w-full bg-transparent text-2xl font-semibold text-white outline-none"
          placeholder="Untitled entry"
        />
        <div className="flex shrink-0 items-center gap-3">
          <PresenceAvatars users={others} />
          <StatusPill status={status} />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Link to other entries with <code>[[Entry Title]]</code>.
      </p>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
