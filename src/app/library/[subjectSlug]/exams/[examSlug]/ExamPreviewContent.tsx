"use client";
import Link from "next/link";
import {
  PieChart,
  BarChart,
  Play,
  ChevronRight,
  GraduationCap,
  Clock,
  FileText,
  Lock,
  Gift,
  Crown,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface ExamPreviewContentProps {
  exam: any;
  user: any;
  difficultyCounts: any;
  sortedTopics: [string, unknown][];
  totalQuestions: number;
  isUnlocked: boolean;
  libraryContext: {
    subjectSlug: string;
    subjectName: string;
    subjectIcon?: string;
  };
}

export function ExamPreviewContent({
  exam,
  user,
  difficultyCounts,
  sortedTopics,
  totalQuestions,
  isUnlocked,
  libraryContext,
}: ExamPreviewContentProps) {
  const startLink = `/practice/${libraryContext.subjectSlug}/exam/${exam.routeId || exam.slug}`;

  // Use GraduationCap as the main icon for Exams
  const IconComponent = <GraduationCap className="size-20 text-indigo-500" />;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f0f4fc] dark:bg-slate-950">
      <AmbientBackground />
      <Header user={user} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-12">
          <Link
            href="/library"
            className="hover:text-blue-600 transition-colors"
          >
            Library
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href={`/library/${libraryContext.subjectSlug}`}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            {libraryContext.subjectIcon && (
              <span>{libraryContext.subjectIcon}</span>
            )}
            {libraryContext.subjectName}
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-slate-500 dark:text-slate-400">Mock Exam</span>
          <ChevronRight className="size-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {exam.title}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Column: Visual Identity & Quick Actions */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <GlassPanel className="w-full min-h-[500px] h-auto p-8 flex flex-col items-center justify-center text-center relative bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 mb-6 p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
                {IconComponent}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">
                {exam.title}
              </h2>

              <div className="mt-4 flex items-center gap-2 relative z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="size-3" /> Mock Exam
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 w-full relative z-10">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {totalQuestions}
                  </div>
                  <div className="text-[14px] uppercase tracking-wider font-bold text-slate-400">
                    Questions
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {exam.duration_minutes}
                  </div>
                  <div className="text-[14px] uppercase tracking-wider font-bold text-slate-400">
                    Minutes
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Right Column: Details & Enrollment */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                {exam.title}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic text-balance">
                &quot;
                {exam.description ||
                  "Test your knowledge under real exam conditions with this mock exam."}
                &quot;
              </p>
            </div>

            {/* Action Area */}
            <div className="mb-12">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="size-5 text-slate-500" />
                    Ready to start?
                  </h3>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                    <FileText className="size-3.5" /> Full Simulation
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="flex flex-wrap gap-4">
                    <Link href={startLink} className="flex-1 sm:flex-none">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] text-lg rounded-xl shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Play className="size-5 mr-2 fill-current" />
                        Start Mock Exam
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <Lock className="size-5 text-slate-500" />
                      Locked Exam
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {exam.unlock_type === "paid"
                        ? `This is a paid mock exam. Purchase for ${
                            exam.price ? `$${exam.price}` : "one-time access"
                          } to unlock.`
                        : exam.unlock_type === "referral"
                          ? "This is a referral reward exam. Invite friends to unlock it for free."
                          : "This is a premium mock exam. Upgrade your account or purchase separately to access."}
                    </p>

                    {exam.unlock_type === "paid" ? (
                      <button
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-colors"
                        onClick={() =>
                          alert("Payment integration coming soon!")
                        }
                      >
                        <DollarSign className="size-5" />
                        Purchase for {exam.price ? `$${exam.price}` : "Access"}
                      </button>
                    ) : exam.unlock_type === "referral" ? (
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 mb-12">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="size-5 text-blue-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Difficulty Distribution
                  </h3>
                </div>
                <div className="space-y-4">
                  {["easy", "medium", "hard"].map((lvl) => (
                    <div key={lvl} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-slate-600 dark:text-slate-400">
                          {lvl}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {Math.round(
                            (difficultyCounts[lvl] / totalQuestions) * 100,
                          ) || 0}
                          %
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            lvl === "easy"
                              ? "bg-emerald-400"
                              : lvl === "medium"
                                ? "bg-amber-400"
                                : "bg-red-400"
                          }`}
                          style={{
                            width: `${
                              (difficultyCounts[lvl] / totalQuestions) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
          </div>
        </div>
      </main>
    </div>
  );
}
