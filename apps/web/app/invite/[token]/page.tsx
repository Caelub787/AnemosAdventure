import Link from "next/link";
import { createServerSupabaseClient } from "@arcanavtt/data-access/server";
import { invitationsRepo } from "@arcanavtt/data-access";
import { AcceptInvitationButton } from "@/components/invitations/AcceptInvitationButton";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createServerSupabaseClient();

  const [preview, userResult] = await Promise.all([
    invitationsRepo.getInvitationPreview(supabase, token),
    supabase.auth.getUser(),
  ]);

  const user = userResult.data.user;

  if (!preview) {
    return (
      <div className="mx-auto max-w-sm py-24 text-center">
        <h1 className="text-lg font-semibold text-white">Invitation not found</h1>
        <p className="mt-2 text-sm text-slate-400">This invitation link is invalid, expired, or already used.</p>
      </div>
    );
  }

  if (preview.status !== "pending") {
    return (
      <div className="mx-auto max-w-sm py-24 text-center">
        <h1 className="text-lg font-semibold text-white">Invitation already {preview.status}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm py-24 text-center">
      <h1 className="text-lg font-semibold text-white">
        Join <strong>{preview.project_name}</strong>
      </h1>
      <p className="mt-2 text-sm text-slate-400">You&apos;ve been invited as {preview.role}.</p>

      <div className="mt-6">
        {user ? (
          user.email?.toLowerCase() === preview.email.toLowerCase() ? (
            <AcceptInvitationButton token={token} />
          ) : (
            <p className="text-sm text-amber-400">
              This invitation was sent to {preview.email}, but you&apos;re signed in as {user.email}.
            </p>
          )
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href={`/signup?next=${encodeURIComponent(`/invite/${token}`)}`}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Create an account to accept
            </Link>
            <Link
              href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
              className="text-sm text-slate-400 hover:underline"
            >
              Already have an account? Log in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
