import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/" className="text-xl font-semibold tracking-tight text-white">
        ArcanaVTT
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
