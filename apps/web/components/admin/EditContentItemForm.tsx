"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { contentRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";
import type { ContentStatus } from "@arcanavtt/db-types";

export function EditContentItemForm({
  id,
  initialTitle,
  initialText,
  status,
}: {
  id: string;
  initialTitle: string;
  initialText: string;
  status: ContentStatus;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState(initialText);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  const supabase = createClient();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <span className="w-fit rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{status}</span>

      <FormField id="title" label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium text-slate-200">
          Body
        </label>
        <textarea
          id="body"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={6}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={busy}
          onClick={() => withBusy(async () => void (await contentRepo.updateContentItem(supabase, id, { title, body: { text } })))}
        >
          Save draft
        </Button>
        {status !== "published" && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => withBusy(async () => void (await contentRepo.publishContentItem(supabase, id)))}
          >
            Publish
          </Button>
        )}
        {status === "published" && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => withBusy(async () => void (await contentRepo.unpublishToDraft(supabase, id)))}
          >
            Unpublish
          </Button>
        )}
        {status !== "archived" && (
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => withBusy(async () => void (await contentRepo.archiveContentItem(supabase, id)))}
          >
            Archive
          </Button>
        )}
      </div>
    </div>
  );
}
