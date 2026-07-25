import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/getCurrentUser";
import { profilesRepo } from "@arcanavtt/data-access";
import { ProfileSettingsForm } from "./ProfileSettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const profile = await profilesRepo.getProfile(supabase, user.id);

  const notificationSettings = profile.notification_settings as { mentions?: boolean; invitations?: boolean };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-white">Profile settings</h1>
      <div className="mt-6">
        <ProfileSettingsForm
          userId={user.id}
          initial={{
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url ?? "",
            notifyMentions: notificationSettings?.mentions ?? true,
            notifyInvitations: notificationSettings?.invitations ?? true,
          }}
        />
      </div>
    </div>
  );
}
