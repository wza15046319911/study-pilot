import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/types/database";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Double check admin status (middleware handles this too, but for type safety/redirects)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) {
    redirect("/login");
  }

  // Fetch user profile for Header
  const { data: profileData } = await (await supabase)
    .from("profiles")
    .select("id, username, avatar_url, created_at, last_practice_date")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  const userData = {
    username:
      profile?.username ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Admin",
    avatar_url:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <AmbientBackground />
      <Header user={userData} isAdmin={true} />
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
