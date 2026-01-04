import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubjectsContent } from "./SubjectsContent";
import { Profile } from "@/types/database";

export default async function SubjectsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select(
      "id, username, level, streak_days, avatar_url, created_at, last_practice_date"
    )
    .eq("id", user.id)
    .single();

  // Explicit type assertion
  const profile = profileData as Profile | null;

  // Fetch all subjects with real question count
  const { data: subjectsData, error } = await supabase
    .from("subjects")
    .select("*, questions(count)")
    .order("id");

  if (error) {
    console.error("Error fetching subjects:", error);
  }

  // Transform data to match Subject interface but with real count
  const subjects = (subjectsData || []).map((subject: any) => ({
    ...subject,
    question_count: subject.questions?.[0]?.count || 0,
    // Remove the extra aggregation property so it matches the type clean-ish
  })) as unknown as import("@/types/database").Subject[];

  if (error) {
    console.error("Error fetching subjects:", error);
  }

  const userData = {
    username:
      profile?.username ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User",
    avatar_url:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: profile?.is_vip || false,
  };

  const isAdmin =
    !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} isAdmin={isAdmin} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Explore Subjects
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Choose your learning path and master any topic with our expertly
            curated question banks.
          </p>
        </div>

        <SubjectsContent subjects={subjects || []} />
      </main>
    </div>
  );
}
