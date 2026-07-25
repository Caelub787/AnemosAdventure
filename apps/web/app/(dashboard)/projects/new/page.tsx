import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { CreateProjectForm } from "./CreateProjectForm";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const { user } = await requireUser();

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-white">New project</h1>
      <p className="mt-1 text-sm text-slate-400">
        A project holds your World Builder entries, maps, and campaigns together.
      </p>
      <div className="mt-6">
        <CreateProjectForm ownerId={user.id} />
      </div>
    </div>
  );
}
