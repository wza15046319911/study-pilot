import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mastering Spaced Repetition for Finals | StudyPilot Blog",
  description:
    "Learn how to optimize your study schedule using the scientifically proven spaced repetition technique to retain information longer.",
};

export default async function SpacedRepetitionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const profile = profileData as Profile | null;
    userData = {
      username: profile?.username || user.email?.split("@")[0] || "User",
      avatar_url: profile?.avatar_url ?? undefined,
      is_vip: profile?.is_vip || false,
    };
  } else {
    userData = { username: "Guest", is_vip: false };
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Blog
        </Link>

        <div className="grid lg:grid-cols-[1fr_240px] gap-16">
          {/* Main Content */}
          <article className="max-w-2xl">
            {/* Cover Image */}
            <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100 dark:bg-slate-800 mb-12 overflow-hidden flex items-center justify-center">
              <div className="flex items-center gap-6">
                <div className="size-20 rounded-2xl bg-purple-600 flex items-center justify-center text-3xl">
                  🧠
                </div>
                <div className="size-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  SP
                </div>
              </div>
            </div>

            {/* Intro */}
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-12">
              Learn how to optimize your study schedule using the scientifically
              proven spaced repetition technique to retain information longer
              and ace your finals.
            </p>

            {/* Content */}
            <div className="space-y-14">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  What is Spaced Repetition?
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Spaced repetition is a learning technique that involves
                  reviewing information at increasing intervals over time.
                  Instead of cramming all at once, you space out your study
                  sessions to maximize long-term retention.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  The method is based on the "forgetting curve" — the idea that
                  our memory of new information decays exponentially unless we
                  actively review it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  The Science Behind It
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Research in cognitive psychology has consistently shown that
                  spaced practice leads to better retention than massed practice
                  (cramming). Each review session strengthens the neural
                  pathways associated with that memory.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border-l-4 border-purple-500">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">
                      Optimal Spacing Pattern:
                    </strong>{" "}
                    1 day → 3 days → 7 days → 14 days → 30 days
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  How to Implement
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  The easiest way to implement spaced repetition is through
                  flashcard apps that automatically schedule reviews based on
                  your performance. StudyPilot's Flashcard mode does exactly
                  this.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  When you review a card and mark it as "easy," the app
                  schedules it for a longer interval. If you struggle, it shows
                  up again sooner.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  StudyPilot Flashcards
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Our built-in flashcard system uses a modified SM-2 algorithm
                  to optimize your review schedule. Questions you find difficult
                  appear more frequently, while well-known material fades into
                  longer intervals.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Start using spaced repetition today and watch your retention
                  rates soar.
                </p>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  STUDY TIPS
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  MEMORY
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  On this page
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>What is Spaced Repetition?</li>
                  <li>The Science Behind It</li>
                  <li>How to Implement</li>
                  <li>StudyPilot Flashcards</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Share this article
                </h3>
                <div className="flex gap-3">
                  <button className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
                    𝕏
                  </button>
                  <button className="size-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors font-bold">
                    in
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
