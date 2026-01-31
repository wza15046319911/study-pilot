import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "How to Efficiently Use Past Exam Papers | StudyPilot Blog",
  description:
    "Past papers are the gold standard of exam preparation. Learn the 4-step framework to maximize their value and skyrocket your grades.",
};

export default async function PastPapersGuidePage() {
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
                <div className="size-20 rounded-2xl bg-emerald-600 flex items-center justify-center text-3xl">
                  📝
                </div>
                <div className="size-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                  A+
                </div>
              </div>
            </div>

            {/* Header */}
            <header className="mb-10 font-sans">
              <div className="flex items-center gap-3 mb-6 text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>Study Tips</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Jan 7, 2026
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  6 min read
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                How to Efficiently Use Past Exam Papers
              </h1>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  SP
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    StudyPilot Team
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Education Experts
                  </div>
                </div>
              </div>
            </header>

            {/* Intro */}
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
              If there is one "hack" that consistently separates top-performing
              students from the rest, it's their relationship with past exam
              papers. But simply completing them isn't enough. Here is the
              4-step framework to maximize their value.
            </p>

            {/* Content */}
            <div className="space-y-14 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  The "Simulation" Mindset
                </h2>
                <p className="mb-6">
                  Most students treat past papers like homework: they do a
                  question, check the notes, grab a snack, and resume. This
                  builds a false sense of security.
                </p>
                <p>
                  To get real value, you must <strong>simulate</strong> exam
                  conditions.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-600">
                  <li>Clear your desk of all notes and textbooks.</li>
                  <li>Set a timer for the exact duration of the real exam.</li>
                  <li>Do not check your phone or take breaks.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  The "Red Pen" Method
                </h2>
                <p className="mb-6">
                  When marking your work, be ruthless. If your answer is "sort
                  of" right but misses the specific keyword the marking scheme
                  wants, mark it wrong.
                </p>
                <blockquote className="border-l-4 border-emerald-500 pl-6 py-2 italic text-slate-600 dark:text-slate-400 my-8">
                  "You learn more from a mistake you analyzed than a correct
                  answer you guessed."
                </blockquote>
                <p>
                  Use a distinct color (like red) to correct your work. Write
                  down <em>why</em> you got it wrong. Was it a calculation
                  error? A misunderstanding of the concept? Or did you just
                  misread the question?
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Pattern Recognition
                </h2>
                <p className="mb-6">
                  Lecturers are creatures of habit. If you analyze 3-5 years of
                  past papers, you will start to see patterns.
                </p>
                <p>
                  Create a "Topic Frequency" table. If "Thermodynamics Cycle"
                  has appeared as Question 3 every year for the last 4 years,
                  it is highly likely to appear again. Focus your final revision
                  days on these high-probability topics.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Closing the Loop
                </h2>
                <p className="mb-6">
                  The final step is arguably the most important. Once you have
                  identified your weak areas from a past paper, go back to your
                  core study material (or StudyPilot question banks) and drill
                  that specific topic.
                </p>
                <p>
                  Don't just move on to the next past paper immediately. Fix the
                  leak in your knowledge bucket first.
                </p>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8 font-sans">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase">
                  Exams
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase">
                  Productivity
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  On this page
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>The "Simulation" Mindset</li>
                  <li>The "Red Pen" Method</li>
                  <li>Pattern Recognition</li>
                  <li>Closing the Loop</li>
                </ul>
              </div>

              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                  Need more practice?
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Access 50+ curated result-verified question banks on StudyPilot.
                </p>
                <Link
                  href="/library"
                  className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-xl text-sm font-bold transition-colors"
                >
                  Go to Library
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
