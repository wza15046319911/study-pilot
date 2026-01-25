"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  ChevronRight,
  GraduationCap,
  Play,
  FileText,
  Bookmark,
  BookmarkCheck,
  Lock,
  Gift,
  Crown,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { toggleExamCollection } from "@/app/library/actions";

interface ExamPreviewContentProps {
  exam: any;
  user: any;
  isCollected: boolean;
  isUnlocked: boolean;
  libraryContext?: {
    subjectSlug: string;
    subjectName: string;
    subjectIcon?: string;
  };
}

export function ExamPreviewContent({
  exam,
  user,
  isCollected,
  isUnlocked,
  libraryContext,
}: ExamPreviewContentProps) {
  const [collected, setCollected] = useState(isCollected);
  const [isPending, startTransition] = useTransition();

  const handleToggleCollection = () => {
    startTransition(async () => {
      const res = await toggleExamCollection(exam.id);
      if (res.success && res.isCollected !== undefined) {
        setCollected(res.isCollected);
      }
    });
  };

  const getStartLink = () => {
    if (libraryContext) {
      return `/library/${libraryContext.subjectSlug}/exams/${exam.slug}`;
    }
    // Fallback if accessed directly (though typically it's nested or we have subject info)
    return `/library/${exam.subject.slug}/exams/${exam.slug}`;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
      <AmbientBackground />
      <Header user={user} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-12">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href="/library"
            className="hover:text-blue-600 transition-colors"
          >
            Library
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {exam.title}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Column: Exam Cover */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Exam Cover Visualization (Violet Theme) */}
            <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-r-2xl rounded-l-sm transform shadow-2xl mb-8 group perspective-[1500px]">
              <div className="absolute inset-0 bg-[#8b5cf6] rounded-r-2xl rounded-l-sm shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)] overflow-hidden border-l-8 border-[#4c1d95]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20 mix-blend-overlay pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/30" />

                <div className="relative h-full flex flex-col p-8 z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 text-white font-bold text-base tracking-wide">
                      <GraduationCap className="size-3.5" />
                      Mock Exam
                    </div>
                  </div>

                  <div className="mt-4 mb-auto text-center">
                    <div className="w-12 h-0.5 bg-white/40 mb-6 mx-auto opacity-70" />
                    <h3 className="text-3xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-md">
                      {exam.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-white/40 mt-6 mx-auto opacity-70" />
                  </div>

                  <div className="text-center mt-8">
                    <div className="text-xs font-mono text-purple-100 tracking-[0.2em] uppercase opacity-80 mb-2">
                      {exam.duration_minutes} MINS
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white font-bold text-sm bg-purple-900/30 py-2 rounded-lg border border-purple-400/30">
                      Full Simulation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  {exam.title}
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic text-balance">
                  &quot;Test your knowledge under real exam conditions.&quot;
                </p>
              </div>
              <button
                onClick={handleToggleCollection}
                disabled={isPending}
                className={`flex-shrink-0 p-3 rounded-xl border transition-all ${
                  collected
                    ? "bg-violet-100 border-violet-200 text-violet-600 dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-400"
                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                }`}
                title={collected ? "Remove from Library" : "Add to Library"}
              >
                {collected ? (
                  <BookmarkCheck className="size-6" />
                ) : (
                  <Bookmark className="size-6" />
                )}
              </button>
            </div>

            {/* Exam Details Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                  <Clock className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    Duration
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {exam.duration_minutes} Minutes
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                    Format
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Full {exam.exam_type} Simulation
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
              {isUnlocked ? (
                <div className="flex flex-col gap-4">
                  <Link href={getStartLink()} className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto min-w-[200px] text-lg rounded-xl shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white"
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
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-colors"
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
        </div>
      </main>
    </div>
  );
}
