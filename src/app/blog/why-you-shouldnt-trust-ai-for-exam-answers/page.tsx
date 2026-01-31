import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Why You Shouldn't Rely on AI for Exam Answers | StudyPilot Blog",
  description:
    "While AI tools like ChatGPT are powerful, using them for exam preparation carries significant risks. Discover why human-verified resources are superior.",
};

export default async function AIExamAnswersPage() {
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
                <div className="size-20 rounded-2xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-3xl">
                  🤖
                </div>
                <div className="size-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  SP
                </div>
              </div>
            </div>

            {/* Header */}
            <header className="mb-10 font-sans">
              <div className="flex items-center gap-3 mb-6 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <span>Education</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Jan 6, 2026
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  5 min read
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                Why You Shouldn't Rely on AI for Exam Answers
              </h1>
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 border border-white dark:border-slate-700 shadow-sm">
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
              While AI tools like ChatGPT are powerful, using them for exam
              preparation carries significant risks. Discover why human-verified
              resources are superior for academic success.
            </p>

            {/* Content */}
            <div className="space-y-14 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  The Allure of AI in Education
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  In the age of generative AI, it's tempting to copy-paste an
                  exam question into a chatbot and trust the instant response.
                  After all, these models have read the entire internet, right?
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  While Large Language Models (LLMs) are impressive, they are
                  fundamentally <strong>predictive text engines</strong>, not
                  knowledge bases. They prioritize sounding plausible over being
                  factually correct.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  The Hallucination Problem
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  The most critical flaw of AI models is "hallucination." An AI
                  can confidently generate a completely fabricated fact, a
                  non-existent legal precedent, or a chemically impossible
                  reaction.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border-l-4 border-blue-500 space-y-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">
                      1. False Confidence:
                    </strong>{" "}
                    AI answers don't come with a "confidence score." A wrong
                    answer looks just as authoritative as a right one.
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">
                      2. Subtle Errors:
                    </strong>{" "}
                    In complex subjects like engineering or medicine, an answer
                    might be 95% correct but contain a fatal flaw in the final
                    step.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Lack of Curriculum Context
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  University exams are specific to a course's syllabus. An AI
                  model gives you a "general consensus" answer, which might
                  contradict the specific methodology or notation taught by your
                  professor.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  For example, a variable name in a Physics equation might
                  differ between textbooks. An AI might use the most common
                  notation, while your exam marks you down for not using the
                  course-standard notation.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Reasoning vs. Pattern Matching
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Exams test your ability to <em>reason</em>. AI approximates
                  reasoning by matching patterns it has seen before.
                </p>
                <blockquote className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg italic text-slate-700 dark:text-slate-300">
                  "Learning is about the process of arriving at an answer, not
                  just the answer itself. If you rely on AI to bypass the
                  struggle, you bypass the learning."
                </blockquote>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  The StudyPilot Advantage
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  This is why platforms like <strong>StudyPilot</strong> are
                  essential. Our question banks are:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300">
                  <li>
                    <strong>Curated by Humans:</strong> Every question is
                    reviewed for accuracy.
                  </li>
                  <li>
                    <strong>Syllabus-Aligned:</strong> We know exactly what your
                    course covers.
                  </li>
                  <li>
                    <strong>Explanation-Rich:</strong> We explain <em>why</em>{" "}
                    an answer is correct.
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Conclusion
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Use AI as a tutor to explain concepts, or a brainstorming
                  partner. But when it comes to specific, high-stakes exam
                  answers, trust verified sources. Your GPA will thank you.
                </p>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  EDUCATION
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  AI
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  On this page
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>The Allure of AI in Education</li>
                  <li>The Hallucination Problem</li>
                  <li>Lack of Curriculum Context</li>
                  <li>Reasoning vs. Pattern Matching</li>
                  <li>The StudyPilot Advantage</li>
                  <li>Conclusion</li>
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
