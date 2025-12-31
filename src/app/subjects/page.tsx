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
  };

  const isAdmin =
    !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} isAdmin={isAdmin} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose a Subject</h1>
          <p className="text-[#4c669a]">
            Select the subject you want to practice and start your learning
            journey
          </p>
        </div>

        <SubjectsContent subjects={subjects || []} />
      </main>
    </div>
  );
}
