import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { adminRepo } from "@arcanavtt/data-access";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const isAdmin = await adminRepo.isCurrentUserAdmin(supabase, user.id);

  // Administrative permissions are intentionally separate from project roles:
  // a project owner is not an admin, and an admin has no special project access.
  if (!isAdmin) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Administration</h1>
        <nav aria-label="Admin sections" className="mt-3 flex gap-4 border-b border-slate-800 text-sm">
          <Link href="/admin/content" className="px-1 pb-2 text-slate-300 hover:text-white">
            Content
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
