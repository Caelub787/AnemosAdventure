"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  project_id: string;
  node_type: "world_entry" | "map" | "campaign";
  search_text: string;
}

const SECTION_PATH: Record<SearchResult["node_type"], string> = {
  world_entry: "world",
  map: "maps",
  campaign: "campaigns",
};

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return;
      const data = await response.json();
      setResults(data.results ?? []);
      setOpen(true);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(`/projects/${result.project_id}/${SECTION_PATH[result.node_type]}/${result.id}`);
  }

  return (
    <div ref={containerRef} className="relative w-48 sm:w-64">
      <label htmlFor="global-search" className="sr-only">
        Search ArcanaVTT
      </label>
      <input
        id="global-search"
        type="search"
        placeholder="Search…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus-visible:border-violet-500"
      />

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 w-72 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-lg"
        >
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => goTo(result)}
                className="block w-full truncate px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                {result.search_text.slice(0, 60) || "Untitled"}
                <span className="ml-2 text-xs text-slate-500">{result.node_type.replace("_", " ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
