import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { createClient } from "@/lib/supabase/server";
import { UserSettingsClient } from "./UserSettingsClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profileSettings.pageMeta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ProfileSettingsPage() {
  const t = await getTranslations("profileSettings.page");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("username, avatar_url, is_vip, email_notifications_enabled")
    .eq("id", user.id)
    .single();

  const profile = profileData as {
    username: string | null;
    avatar_url: string | null;
    is_vip: boolean;
    email_notifications_enabled: boolean | null;
  } | null;

  const headerUser = {
    username: profile?.username || user.user_metadata?.name || t("fallbackUser"),
    avatar_url:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: profile?.is_vip || false,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header user={headerUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <UserSettingsClient
          initialEmailNotificationsEnabled={
            profile?.email_notifications_enabled !== false
          }
        />
      </main>
    </div>
  );
}
