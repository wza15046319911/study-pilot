import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { UserMockExamsClient } from "./UserMockExamsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Mock Exams | Profile",
  description: "View and manage your history of mock exams",
};

export default async function MockExamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's exam collections
  let userExams: any[] = [];
  try {
    const { data } = await supabase
      .from("user_exam_collections")
      .select(
        `
        id,
        exam_id,
        added_at,
        completion_count,
        best_score,
        best_time_seconds,
        last_attempted_at,
        exams (
          id,
          subject_id,
          title,
          slug,
          duration_minutes,
          subjects (
            id,
            name,
            slug
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    userExams = data || [];
  } catch (error) {
    console.error("Error fetching exams:", error);
    userExams = [];
  }

  // Get user profile for header
  const { data: profileData } = await supabase
    .from("profiles")
    .select("username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const profile = profileData as {
    username: string | null;
    avatar_url: string | null;
    is_vip: boolean;
  } | null;

  const headerUser = {
    username: profile?.username || user.user_metadata?.name || "User",
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
            My Mock Exams
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review your past exam attempts and track your improvement.
          </p>
        </div>

        <UserMockExamsClient initialData={userExams} />
      </main>
    </div>
  );
}
