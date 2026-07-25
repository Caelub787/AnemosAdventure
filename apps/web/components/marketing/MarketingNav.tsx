import Link from "next/link";
import { DownloadAppButton } from "./DownloadAppButton";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-900 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          ArcanaVTT
        </Link>

        <nav aria-label="Main" className="hidden gap-6 text-sm text-slate-300 sm:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#about" className="hover:text-white">
            About
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <DownloadAppButton />
          <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-200 hover:text-white">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
