import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { UserWeeklyPracticeClient } from "./UserWeeklyPracticeClient";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profileWeeklyPractice.pageMeta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function WeeklyPracticePage() {
  const t = await getTranslations("profileWeeklyPractice.page");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profilePromise = (supabase.from("profiles") as any)
    .select("username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const practicesPromise = (supabase.from("weekly_practices") as any)
    .select(
      `
      id,
      title,
      slug,
      description,
      week_start,
      subject:subjects (
        name,
        slug
      ),
      items:weekly_practice_items(count)
    `,
    )
    .eq("is_published", true)
    .order("week_start", { ascending: false });

  const [{ data: profile }, { data: practices }] = await Promise.all([
    profilePromise,
    practicesPromise,
  ]);

  const headerUser = {
    username: profile?.username || user.user_metadata?.name || t("fallbackUser"),
    avatar_url:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: profile?.is_vip || false,
  };

  const weeklyIds =
    (practices as any[])?.map((practice: any) => practice.id).filter(Boolean) ||
    [];

  const { data: submissions } = weeklyIds.length
    ? await (supabase.from("weekly_practice_submissions") as any)
        .select(
          "weekly_practice_id, submitted_at, answered_count, correct_count, total_count",
        )
        .eq("user_id", user.id)
        .in("weekly_practice_id", weeklyIds)
        .order("submitted_at", { ascending: false })
    : { data: [] };

  const latestSubmissionMap = new Map<number, any>();
  (submissions || []).forEach((submission: any) => {
    if (!latestSubmissionMap.has(submission.weekly_practice_id)) {
      latestSubmissionMap.set(submission.weekly_practice_id, submission);
    }
  });

  const practicesWithProgress =
    ((practices as any[]) || []).map((practice: any) => ({
      ...practice,
      latestSubmission: latestSubmissionMap.get(practice.id) || null,
    })) || [];

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

        <UserWeeklyPracticeClient initialData={practicesWithProgress} />
      </main>
    </div>
  );
}
