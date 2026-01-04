import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import {
  Lock,
  Crown,
  Gift,
  Star,
  BookOpen,
  PieChart,
  BarChart,
  Play,
  RotateCw,
  Clock,
  Check,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function QuestionBankPreviewPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/question-banks/${slug}`);
  }

  // Fetch Bank + basic items info
  const { data: bank, error: bankError } = await (
    supabase.from("question_banks") as any
  )
    .select(
      `
      *,
      subject:subjects(name, icon)
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!bank || bankError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Question Bank Not Found"
            description="The question bank you are trying to access does not exist."
            backLink="/question-banks"
            backText="Back to Question Banks"
          />
        </div>
      </div>
    );
  }

  // Fetch User Profile for Access Check
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  // Check Unlock Status
  let isUnlocked = false;
  let unlockReason = "";

  if (!bank.is_premium && bank.unlock_type === "free") {
    isUnlocked = true;
    unlockReason = "Free";
  } else {
    // Check Premium
    if (bank.is_premium && profile?.is_vip) {
      isUnlocked = true;
      unlockReason = "Premium";
    }

    // Check Explicit Unlocks (Referral or Purchase) if not already unlocked
    if (!isUnlocked) {
      const { data: unlock } = await (supabase.from("user_bank_unlocks") as any)
        .select("id, unlock_type")
        .eq("user_id", user.id)
        .eq("bank_id", bank.id)
        .single();

      if (unlock) {
        isUnlocked = true;
        unlockReason = unlock.unlock_type;
      }
    }
  }

  // Fetch Stats Data: Items -> Questions -> Difficulty & Topic
  const { data: items } = await supabase
    .from("question_bank_items")
    .select(
      `
      question:questions(
        difficulty,
        topic_id
      )
    `
    )
    .eq("bank_id", bank.id);

  const questions = (items || []).map((i: any) => i.question);
  const totalQuestions = questions.length;

  // Fetch Topics Map (since we only have topic_id)
  // We can just fetch all topics for the subject to map names
  const { data: topics } = await supabase
    .from("topics")
    .select("id, name")
    .eq("subject_id", bank.subject_id);

  const topicMap = new Map(topics?.map((t: any) => [t.id, t.name]) || []);

  // Calculate Stats
  const difficultyCounts = questions.reduce(
    (acc: any, q: any) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  const topicCounts = questions.reduce((acc: any, q: any) => {
    const topicName =
      q.topic_id && topicMap.has(q.topic_id)
        ? topicMap.get(q.topic_id)
        : "General";
    acc[topicName] = (acc[topicName] || 0) + 1;
    return acc;
  }, {});

  const sortedTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5); // Top 5 topics

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href="/question-banks"
            className="hover:text-blue-600 transition-colors"
          >
            Question Banks
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {bank.title}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Book Cover */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Book Cover Visualization (Static Version of QuestionBankItem) */}
            <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-r-2xl rounded-l-sm transform shadow-2xl mb-8 group perspective-[1500px]">
              <div className="absolute inset-0 bg-[#e0c097] rounded-r-2xl rounded-l-sm shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)] overflow-hidden border-l-8 border-[#5d4037]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20 mix-blend-overlay pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/30" />

                <div className="relative h-full flex flex-col p-8 z-10">
                  <div className="flex justify-between items-start mb-6">
                    {bank.unlock_type === "referral" ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/90 text-white rounded-lg shadow-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        <Gift className="size-3.5" />
                        Invite Unlock
                      </div>
                    ) : bank.is_premium ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/90 text-white rounded-lg shadow-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        <Crown className="size-3.5" />
                        Premium
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/90 text-white rounded-lg shadow-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                        <Star className="size-3.5" />
                        Public
                      </div>
                    )}
                  </div>

                  <div className="mt-4 mb-auto text-center">
                    <div className="w-12 h-0.5 bg-[#d7ccc8] mb-6 mx-auto opacity-70" />
                    <h3 className="text-3xl font-serif font-bold text-[#fff8e1] leading-tight tracking-tight drop-shadow-md">
                      {bank.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-[#d7ccc8] mt-6 mx-auto opacity-70" />
                  </div>

                  <div className="text-center mt-8">
                    <div className="text-xs font-mono text-[#d7ccc8] tracking-[0.2em] uppercase opacity-80 mb-2">
                      Vol. {totalQuestions}
                    </div>
                    {isUnlocked ? (
                      <div className="flex items-center justify-center gap-2 text-green-100 font-bold text-sm bg-green-900/40 py-2 rounded-lg">
                        <Check className="size-4" />
                        UNLOCKED
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-red-100 font-bold text-sm bg-red-900/40 py-2 rounded-lg">
                        <Lock className="size-4" />
                        LOCKED
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Stats */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                {bank.title}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic text-balance">
                &quot;
                {bank.description ||
                  "Master the concepts with this curated collection."}
                &quot;
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {/* Difficulty Stats */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="size-5 text-blue-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Difficulty Distribution
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Easy
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {Math.round(
                          (difficultyCounts.easy / totalQuestions) * 100
                        ) || 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{
                          width: `${
                            (difficultyCounts.easy / totalQuestions) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Medium
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {Math.round(
                          (difficultyCounts.medium / totalQuestions) * 100
                        ) || 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{
                          width: `${
                            (difficultyCounts.medium / totalQuestions) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Hard
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {Math.round(
                          (difficultyCounts.hard / totalQuestions) * 100
                        ) || 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400"
                        style={{
                          width: `${
                            (difficultyCounts.hard / totalQuestions) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart className="size-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Key Topics
                  </h3>
                </div>
                <div className="space-y-3">
                  {sortedTopics.length > 0 ? (
                    sortedTopics.map(([topic, count]) => (
                      <div
                        key={topic}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[70%]">
                          {topic}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                            {count as number}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No topics found
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
              {isUnlocked ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg self-start">
                    <Check className="size-5" />
                    <span className="font-medium">
                      You have access to this bank
                    </span>
                  </div>
                  <Link
                    href={`/question-banks/${slug}/practice`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto min-w-[200px] text-lg rounded-xl shadow-xl shadow-blue-500/20"
                    >
                      <Play className="size-5 mr-2 fill-current" />
                      Start Practicing
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lock className="size-5 text-slate-500" />
                    Locked Content
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {bank.unlock_type === "referral"
                      ? "This is a special reward bank. Invite friends to StudyPilot to unlock it for free."
                      : "This is a premium Question Bank. Upgrade your account or purchase separately to access."}
                  </p>

                  {bank.unlock_type === "referral" ? (
                    <Link href="/profile/referrals">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/25"
                      >
                        <Gift className="size-5 mr-2" />
                        Invite Friends to Unlock
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/pricing">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/25"
                      >
                        <Crown className="size-5 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
