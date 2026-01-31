import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Product Update: Dark Mode & New Question Banks | StudyPilot Blog",
  description:
    "We've listened to your feedback! Introducing a sleek new dark mode and 50+ new question banks.",
};

export default async function ProductUpdatePage() {
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
                <div className="size-20 rounded-2xl bg-green-600 flex items-center justify-center text-3xl">
                  🚀
                </div>
                <div className="size-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  SP
                </div>
              </div>
            </div>

            {/* Header */}
            <header className="mb-10 font-sans">
              <div className="flex items-center gap-3 mb-6 text-sm font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                <span>Product</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Jan 2, 2026
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">
                  3 min read
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                Product Update: Dark Mode & New Question Banks
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
                    Product
                  </div>
                </div>
              </div>
            </header>

            {/* Intro */}
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
              We've listened to your feedback! Introducing a sleek new dark mode
              for late-night study sessions and 50+ new question banks across
              multiple subjects.
            </p>

            {/* Content */}
            <div className="space-y-14 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Dark Mode
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  We've finally added a full dark mode theme! Perfect for those
                  late-night study sessions when you don't want a bright screen
                  blinding you.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Toggle it from the header or let it follow your system
                  preference automatically.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  New Question Banks
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  We've added 50+ new question banks covering a wide range of
                  subjects:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  <li>Psychology 101</li>
                  <li>Data Structures & Algorithms</li>
                  <li>Organic Chemistry</li>
                  <li>Microeconomics</li>
                  <li>Linear Algebra</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-6">
                  Check out the Library to explore all the new content.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  Performance Improvements
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Page load times have been reduced by 40% thanks to Next.js
                  optimizations and smarter caching strategies. The app should
                  feel snappier than ever before.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                  What's Next
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  Coming soon to StudyPilot:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                  <li>AI-powered explanations for every question</li>
                  <li>Collaborative study groups</li>
                  <li>Mobile app improvements</li>
                  <li>Custom flashcard decks</li>
                </ul>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-6">
                  Stay tuned for more updates!
                </p>
              </section>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  PRODUCT
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  UPDATE
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  On this page
                </h3>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>Dark Mode</li>
                  <li>New Question Banks</li>
                  <li>Performance Improvements</li>
                  <li>What's Next</li>
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
