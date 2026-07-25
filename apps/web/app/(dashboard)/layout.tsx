import Link from "next/link";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { adminRepo } from "@arcanavtt/data-access";
import { LogoutButton } from "@/components/LogoutButton";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const isAdmin = await adminRepo.isCurrentUserAdmin(supabase, user.id);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/settings", label: "Settings" },
    ...(isAdmin ? [{ href: "/admin/content", label: "Admin" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-white">
            ArcanaVTT
          </Link>

          <nav aria-label="Main" className="hidden gap-4 text-sm text-slate-300 sm:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <GlobalSearchBar />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-20 sm:pb-6">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-800 bg-slate-950/95 py-2 backdrop-blur sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="px-3 py-1 text-xs text-slate-300 hover:text-white">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
