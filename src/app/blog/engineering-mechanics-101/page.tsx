import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title:
    "Engineering Mechanics: Top 5 Mistakes Students Make | StudyPilot Blog",
  description:
    "From free body diagrams to unit conversion errors, we break down the most common pitfalls in first-year engineering mechanics.",
};

export default async function EngineeringMechanicsPage() {
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
          <article className="max-w-2xl font-serif">
            {/* Cover Image */}
            <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100 dark:bg-slate-800 mb-12 overflow-hidden flex items-center justify-center">
              <div className="flex items-center gap-6">
                <div className="size-20 rounded-2xl bg-orange-600 flex items-center justify-center text-3xl">
                  ⚙️
                </div>
                <div className="size-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  SP
                </div>
              </div>
            </div>

            {/* Header */}
            <header className="mb-10 font-sans">
              <div className="flex items-center gap-3 mb-6 text-sm font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                <span>Engineering</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Dec 28, 2025
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  6 min read
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                Engineering Mechanics: Top 5 Mistakes Students Make
              </h1>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 border border-white dark:border-slate-700 shadow-sm">
                  JW
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Prof. James Wilson
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Senior Lecturer
                  </div>
                </div>
              </div>
            </header>

            {/* Intro */}
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
              From free body diagrams to unit conversion errors, we break down
              the most common pitfalls in first-year engineering mechanics and
              how to avoid them.
            </p>

            {/* Content */}
            <div className="space-y-14 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Common Mistakes Overview
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Engineering Mechanics is a foundational course, but many
                  students struggle with fundamental concepts. Here are the top
                  5 mistakes we see in first-year students and how to fix them.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  1. Free Body Diagrams
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  The most common error is forgetting to isolate the body of
                  interest and include ALL forces acting on it.
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border-l-4 border-orange-500">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>Remember:</strong> If it touches your body, there's
                    a force. Gravity? Always. Normal force? If there's contact.
                    Friction? If there's relative motion or tendency to move.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  2. Unit Conversion Errors
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Mixing SI and Imperial units, or forgetting to convert mm to
                  m, leads to answers that are off by orders of magnitude.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Always double-check your units before plugging numbers into
                  equations. Write them out explicitly in your calculations.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  3. Equilibrium Conditions
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  For static equilibrium, both the sum of forces AND the sum of
                  moments must equal zero. Many students forget the moment
                  equation.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  In 2D problems: ΣFx = 0, ΣFy = 0, ΣM = 0. That's three
                  equations, not two.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  4. Sign Convention Confusion
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Pick a consistent sign convention at the start and stick to
                  it. Positive x to the right, positive y up, counter-clockwise
                  moments positive. Write it down at the top of your solution.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  5. Neglecting Reaction Forces
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  At supports (pins, rollers, fixed ends), there are reaction
                  forces and moments. Don't forget to include them in your free
                  body diagram.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  StudyPilot offers a dedicated Engineering Mechanics question
                  bank with 200+ problems, each with detailed step-by-step
                  solutions.
                </p>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  ENGINEERING
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  MECHANICS
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  On this page
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>Common Mistakes Overview</li>
                  <li>Free Body Diagrams</li>
                  <li>Unit Conversion Errors</li>
                  <li>Equilibrium Conditions</li>
                  <li>Sign Convention Confusion</li>
                  <li>Neglecting Reaction Forces</li>
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
