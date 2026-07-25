"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@arcanavtt/data-access/client";
import { contentRepo } from "@arcanavtt/data-access";
import { Button } from "@arcanavtt/ui";
import { FormField } from "@/components/forms/FormField";

export function CreateContentItemForm({ createdBy }: { createdBy: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const item = await contentRepo.createContentItem(createClient(), {
        title: title.trim(),
        body: { text },
        createdBy,
      });
      router.push(`/admin/content/${item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create content item");
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
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
      <Button onClick={handleCreate} disabled={loading} className="self-start">
        {loading ? "Creating…" : "Create draft"}
      </Button>
    </div>
  );
}
