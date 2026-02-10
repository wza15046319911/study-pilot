import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { UserHomeworkClient } from "./UserHomeworkClient";
import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profileHomework.pageMeta");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HomeworkPage() {
  const t = await getTranslations("profileHomework.page");
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

  const assignmentsPromise = (supabase.from("homework_assignments") as any)
    .select(
      `
      id,
      assigned_at,
      completed_at,
      homework:homeworks!inner (
        id,
        title,
        slug,
        description,
        due_at,
        allowed_modes,
        subject:subjects (
          name,
          slug
        ),
        items:homework_items(count)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("assigned_at", { ascending: false });

  const [{ data: profile }, { data: assignments }] = await Promise.all([
    profilePromise,
    assignmentsPromise,
  ]);

  const homeworkIds =
    (assignments as any[])
      ?.map((assignment) => assignment.homework?.id)
      .filter(Boolean) || [];

  const { data: submissions } = homeworkIds.length
    ? await (supabase.from("homework_submissions") as any)
        .select(
          "homework_id, submitted_at, answered_count, correct_count, total_count",
        )
        .eq("user_id", user.id)
        .in("homework_id", homeworkIds)
        .order("submitted_at", { ascending: false })
    : { data: [] as any[] };

  const latestSubmissionMap = new Map<number, any>();
  (submissions || []).forEach((submission: any) => {
    if (!latestSubmissionMap.has(submission.homework_id)) {
      latestSubmissionMap.set(submission.homework_id, submission);
    }
  });

  const assignmentsWithProgress =
    ((assignments as any[]) || []).map((assignment: any) => ({
      ...assignment,
      latestSubmission: assignment.homework?.id
        ? latestSubmissionMap.get(assignment.homework.id) || null
        : null,
    })) || [];

  const headerUser = {
    username: profile?.username || user.user_metadata?.name || t("fallbackUser"),
    avatar_url:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: profile?.is_vip || false,
  };

  const isVip = profile?.is_vip || false;

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

        {!isVip ? (
          <div className="rounded-3xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 to-white dark:from-slate-900 dark:to-slate-950 p-8 text-center">
            <div className="mx-auto size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lock className="size-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              {t("premium.title")}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              {t("premium.description")}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
            >
              <Crown className="size-4" />
              {t("premium.cta")}
            </Link>
          </div>
        ) : (
          <UserHomeworkClient initialData={assignmentsWithProgress} />
        )}
      </main>
    </div>
  );
}
