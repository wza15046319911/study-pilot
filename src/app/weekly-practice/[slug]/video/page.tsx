import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { VideoLinkButton } from "@/components/common/VideoLinkButton";
import { WeeklyPracticeCard } from "@/components/weekly-practice/WeeklyPracticeCard";
import type { WeeklyPracticeSummaryItem } from "@/components/weekly-practice/shared";
import { createClient } from "@/lib/supabase/server";
import { decodeId } from "@/lib/ids";
import { getYouTubeEmbedUrl, normalizeHttpUrl } from "@/lib/video";
import { fetchWeeklyPracticeSummary } from "@/lib/weekly-practice";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function findPublishedWeeklyPractice(routeId: string) {
  const decodedWeeklyPracticeId = decodeId(routeId);
  const supabase = await createClient();

  let { data: weeklyPractice } = await fetchWeeklyPracticeSummary((selectClause) =>
    (supabase.from("weekly_practices") as any)
      .select(selectClause)
      .eq("slug", routeId)
      .eq("is_published", true)
      .maybeSingle(),
  );

  if (!weeklyPractice && decodedWeeklyPracticeId !== null) {
    const fallbackResult = await fetchWeeklyPracticeSummary((selectClause) =>
      (supabase.from("weekly_practices") as any)
        .select(selectClause)
        .eq("id", decodedWeeklyPracticeId)
        .eq("is_published", true)
        .maybeSingle(),
    );
    weeklyPractice = fallbackResult.data;
  }

  return weeklyPractice;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const t = await getTranslations("profileWeeklyPractice.videoPage.pageMeta");
  const practice = await findPublishedWeeklyPractice(params.slug);

  return {
    title: practice
      ? t("title", { title: practice.title })
      : t("fallbackTitle"),
    description: practice
      ? t("description", { title: practice.title })
      : t("fallbackDescription"),
  };
}

export default async function WeeklyPracticeVideoPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const t = await getTranslations("profileWeeklyPractice.videoPage");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/weekly-practice/${slug}/video`);
  }

  const [practice, profileResult] = await Promise.all([
    findPublishedWeeklyPractice(slug),
    (supabase.from("profiles") as any)
      .select("username, avatar_url, is_vip")
      .eq("id", user.id)
      .single(),
  ]);

  const normalizedVideoUrl = normalizeHttpUrl(practice?.video_url);

  if (!practice || !normalizedVideoUrl) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
        <AmbientBackground />
        <Header
          user={{
            username:
              profileResult.data?.username ||
              user.user_metadata?.name ||
              t("fallbackUser"),
            avatar_url:
              profileResult.data?.avatar_url ||
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              undefined,
            is_vip: profileResult.data?.is_vip || false,
          }}
        />
        <div className="flex flex-1 items-center justify-center">
          <NotFoundPage
            title={t("notFound.title")}
            description={t("notFound.description")}
            backLink="/profile/weekly-practice"
            backText={t("notFound.back")}
          />
        </div>
      </div>
    );
  }

  const { data: latestSubmission } = await (supabase
    .from("weekly_practice_submissions") as any)
    .select(
      "submitted_at, answered_count, correct_count, total_count, weekly_practice_id",
    )
    .eq("user_id", user.id)
    .eq("weekly_practice_id", practice.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const practiceWithProgress: WeeklyPracticeSummaryItem = {
    ...practice,
    latestSubmission: latestSubmission || null,
  };
  const headerUser = {
    username:
      profileResult.data?.username || user.user_metadata?.name || t("fallbackUser"),
    avatar_url:
      profileResult.data?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined,
    is_vip: profileResult.data?.is_vip || false,
  };
  const embeddedVideoUrl = getYouTubeEmbedUrl(normalizedVideoUrl);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <AmbientBackground />
      <Header user={headerUser} />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {practice.title}
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400 md:text-base">
            {t("subtitle")}
          </p>
        </section>

        <WeeklyPracticeCard practice={practiceWithProgress} showVideoCta={false} />

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 p-4 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/90 md:p-6">
          {embeddedVideoUrl ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-white/50 bg-slate-950 shadow-2xl shadow-slate-950/30">
              <div className="aspect-[16/9]">
                <iframe
                  src={embeddedVideoUrl}
                  title={t("embedTitle", { title: practice.title })}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("external.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {t("external.description")}
              </p>
              <div className="mt-6 flex justify-center">
                <VideoLinkButton
                  href={normalizedVideoUrl}
                  label={t("external.cta")}
                  variant="secondary"
                />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
