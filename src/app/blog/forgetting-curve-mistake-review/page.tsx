import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title:
    "The Forgetting Curve: Why Reviewing Mistakes Matters | StudyPilot Blog",
  description:
    "Understand Hermann Ebbinghaus's Forgetting Curve and how to use strategic mistake review to hack your memory retention.",
};

export default async function ForgettingCurvePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />

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
                <div className="size-20 rounded-2xl bg-rose-500 flex items-center justify-center text-3xl">
                  📉
                </div>
                <div className="size-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  SP
                </div>
              </div>
            </div>

            {/* Header */}
            <header className="mb-10 font-sans">
              <div className="flex items-center gap-3 mb-6 text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <span>Learning Science</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Jan 8, 2026
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  6 min read
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                The Forgetting Curve: Why Reviewing Mistakes is Non-Negotiable
              </h1>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 border border-white dark:border-slate-700 shadow-sm">
                  JD
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    James Doe
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Lead Educator
                  </div>
                </div>
              </div>
            </header>

            {/* Intro */}
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
              Have you ever engaged in a marathon study session, feeling like
              you’ve mastered every concept, only to find a week later that 50%
              of that knowledge has evaporated? You’re not alone. You’re just
              experiencing the <strong>Forgetting Curve</strong>.
            </p>

            {/* Content */}
            <div className="space-y-14 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  What is the Forgetting Curve?
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Discovered by German psychologist Hermann Ebbinghaus in 1885,
                  the Forgetting Curve illustrates how information creates a
                  "use-it-or-lose-it" scenario in our brains. Ebbinghaus found
                  that without reinforcement:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300">
                  <li>
                    <strong>Wait 20 minutes:</strong> You forget ~42% of what
                    you learned.
                  </li>
                  <li>
                    <strong>Wait 24 hours:</strong> You forget ~67%.
                  </li>
                  <li>
                    <strong>Wait 31 days:</strong> You retain only ~21% of the
                    original information.
                  </li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  This exponential decay means that learning something once is
                  mathematically inefficient. It’s like filling a bucket with a
                  giant hole in the bottom.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  The Power of Mistake Review
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  While the Forgetting Curve sounds depressing, there is a
                  counter-measure:{" "}
                  <strong>Active Recall via Mistake Review</strong>.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  When you make a mistake, your brain is in a prime state of
                  neuroplasticity. It has recognized a gap between expectation
                  and reality. Reviewing that specific mistake immediately, and
                  then again at spaced intervals, resets the Forgetting Curve.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border-l-4 border-rose-500">
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "A mistake is not a failure; it is a signal for where to
                    focus your next review session."
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  How to Use StudyPilot to Beat the Curve
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  We designed StudyPilot's <strong>Mistake Book</strong>{" "}
                  specifically to combat this decay. Here is the optimal
                  workflow:
                </p>
                <ol className="list-decimal pl-6 space-y-4 mb-6 text-slate-700 dark:text-slate-300">
                  <li>
                    <strong>Immediate Feedback:</strong> During practice, read
                    the explanation for every wrong answer. Don’t just skip it.
                  </li>
                  <li>
                    <strong>End-of-Day Review:</strong> Visit your Profile &gt;
                    Mistakes. Filter by "All Subjects" and tackle the top 5
                    mistakes.
                  </li>
                  <li>
                    <strong>Weekly Clean-Up:</strong> Use the "Practice All"
                    button in your Mistake Book once a week. Your goal is to
                    clear the list.
                  </li>
                </ol>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  By actively targeting your weak points (the mistakes) rather
                  than reviewing what you already know, you flatten the curve
                  and lock knowledge into long-term memory.
                </p>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  LEARNING
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  PRODUCTIVITY
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  On this page
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>What is the Forgetting Curve?</li>
                  <li>The Power of Mistake Review</li>
                  <li>How to Beat the Curve</li>
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
