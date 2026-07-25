import Link from "next/link";
import { ScrollSection } from "@/components/marketing/ScrollSection";

const STEPS = [
  {
    eyebrow: "1. Build a world",
    title: "Write your world, not just your notes",
    description:
      "Draft characters, locations, factions, and lore in a real-time collaborative editor with wiki-style [[links]] between every entry.",
  },
  {
    eyebrow: "2. Draw a map",
    title: "Sketch the places your story happens",
    description: "Lay out regions, cities, and battle maps on a pannable, zoomable canvas that autosaves as you go.",
  },
  {
    eyebrow: "3. Connect everything",
    title: "Locations, characters, and maps — linked",
    description:
      "Drop a marker on the map and connect it straight to its World Builder entry. Rename something once, and it updates everywhere.",
  },
  {
    eyebrow: "4. Launch a campaign",
    title: "Bring your map into a live table",
    description: "The same map you drew opens directly inside a campaign — no exporting, no re-uploading.",
  },
  {
    eyebrow: "5. Play together",
    title: "Real-time, with everyone at the table",
    description: "Live presence, shared state, and automatic reconnection keep your session in sync for every player.",
  },
] as const;

export default function MarketingHomePage() {
  return (
    <>
      <section className="flex min-h-[90vh] snap-start flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Build worlds. Draw maps. Play together.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-400">
          ArcanaVTT connects your tabletop RPG&apos;s world-building, maps, and live sessions in one real-time
          platform — for D&amp;D, your own system, or anything you invent.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            Get started free
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            See how it works
          </a>
        </div>
      </section>

      <div id="features">
        {STEPS.map((step, index) => (
          <ScrollSection key={step.title} {...step} align={index % 2 === 0 ? "left" : "right"}>
            <span className="text-6xl font-semibold text-slate-700">{index + 1}</span>
          </ScrollSection>
        ))}
      </div>

      <section id="about" className="flex min-h-[60vh] snap-start flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-semibold text-white">One connected platform</h2>
        <p className="mt-3 max-w-xl text-slate-400">
          No more juggling separate wiki, map, and VTT tools that don&apos;t talk to each other. ArcanaVTT shares one
          set of projects, permissions, and real-time sync across all three.
        </p>
        <Link
          href="/signup"
          className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
        >
          Create your first project
        </Link>
      </section>
    </>
  );
}
