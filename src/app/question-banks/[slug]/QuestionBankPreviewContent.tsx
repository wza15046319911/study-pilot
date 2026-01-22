"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Lock,
  Crown,
  Gift,
  Star,
  PieChart,
  BarChart,
  Play,
  Check,
  ChevronRight,
  ListChecks,
  DollarSign,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { toggleQuestionBankCollection } from "@/app/library/actions";

interface QuestionBankPreviewContentProps {
  bank: any;
  user: any;
  difficultyCounts: any;
  sortedTopics: [string, unknown][];
  totalQuestions: number;
  isUnlocked: boolean;
  unlockReason: string;
  isCollected: boolean;
  libraryContext?: {
    subjectSlug: string;
    subjectName: string;
    subjectIcon?: string;
  };
}

const modes = [
  {
    id: "practice", // Maps to /practice default
    name: "Standard",
    description: "Practice with custom filters. Track progress.",
    icon: ListChecks,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    ringColor: "ring-blue-500",
  },
];

export function QuestionBankPreviewContent({
  bank,
  user,
  difficultyCounts,
  sortedTopics,
  totalQuestions,
  isUnlocked,
  unlockReason,
  isCollected,
  libraryContext,
}: QuestionBankPreviewContentProps) {
  const [selectedMode, setSelectedMode] = useState("practice");
  const [activeUsers] = useState(() => ((bank.id * 7) % 40) + 12);
  const [collected, setCollected] = useState(isCollected);
  const [isPending, startTransition] = useTransition();

  const handleToggleCollection = () => {
    startTransition(async () => {
      const res = await toggleQuestionBankCollection(bank.id);
      if (res.success && res.isCollected !== undefined) {
        setCollected(res.isCollected);
      }
    });
  };

  const getStartLink = () => {
    const basePath = libraryContext
      ? `/library/${libraryContext.subjectSlug}/question-banks/${bank.slug}`
      : `/question-banks/${bank.slug}`;

    if (selectedMode === "practice") {
      return `${basePath}/practice`;
    }
    return `${basePath}/${selectedMode}`;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f0f4fc] dark:bg-slate-950">
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
            {bank.title}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Column: Book Cover */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Book Cover Visualization */}
            <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-r-2xl rounded-l-sm transform shadow-2xl mb-8 group perspective-[1500px]">
              <div className="absolute inset-0 bg-[#e0c097] rounded-r-2xl rounded-l-sm shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)] overflow-hidden border-l-8 border-[#5d4037]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20 mix-blend-overlay pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/30" />

                <div className="relative h-full flex flex-col p-6 z-10">
                  <div className="flex justify-between items-start mb-4">
                    {bank.unlock_type === "paid" ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium text-xs tracking-wide">
                        <DollarSign className="size-3.5" />
                        <span>{bank.price ? `$${bank.price}` : "Paid"}</span>
                      </div>
                    ) : bank.unlock_type === "referral" ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full shadow-sm border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium text-xs tracking-wide">
                        <Gift className="size-3.5" />
                        <span>Invite Unlock</span>
                      </div>
                    ) : bank.is_premium ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full shadow-sm border border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-medium text-xs tracking-wide">
                        <Crown className="size-3.5" />
                        <span>Premium</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs tracking-wide">
                        <Star className="size-3.5" />
                        <span>Public</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 mb-auto text-center">
                    <div className="w-12 h-0.5 bg-[#d7ccc8] mb-4 mx-auto opacity-70" />
                    <h3 className="text-3xl font-serif font-bold text-[#fff8e1] leading-tight tracking-tight drop-shadow-md">
                      {bank.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-[#d7ccc8] mt-4 mx-auto opacity-70" />
                  </div>

                  <div className="text-center mt-auto pb-2">
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
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  {bank.title}
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic text-balance mb-6">
                  &quot;
                  {bank.description ||
                    "Master the concepts with this curated collection."}
                  &quot;
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

            <div className="mb-8">
              {/* People practicing indicator */}
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                {activeUsers} people practicing right now
              </div>
            </div>

            {/* Stats Grid - Vertical Stack */}
            <div className="grid grid-cols-1 gap-6 mb-12">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="size-5 text-blue-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Difficulty Distribution
                  </h3>
                </div>
                <div className="space-y-4">
                  {/* Difficulty Bars */}
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

            {/* Mode Selection & Action */}
            <div className="mt-auto">
              {isUnlocked ? (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Select Practice Mode
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {modes.map((m) => {
                      const Icon = m.icon;
                      const isSelected = selectedMode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMode(m.id)}
                          className={`group relative p-4 text-left rounded-xl transition-[background-color,border-color,box-shadow] duration-300 border-2 ${
                            isSelected
                              ? `bg-white dark:bg-slate-800 ${m.borderColor} ${m.ringColor} ring-1 shadow-lg`
                              : "bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? m.bgColor
                                  : "bg-gray-100 dark:bg-slate-800"
                              }`}
                            >
                              <Icon
                                className={`size-4 ${
                                  isSelected ? m.color : "text-gray-500"
                                }`}
                              />
                            </div>
                            <span
                              className={`font-bold text-sm ${
                                isSelected
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-600"
                              }`}
                            >
                              {m.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 leading-tight">
                            {m.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <Link href={getStartLink()} className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto min-w-[200px] text-lg rounded-xl shadow-xl shadow-blue-500/20"
                    >
                      <Play className="size-5 mr-2 fill-current" />
                      Start {modes.find((m) => m.id === selectedMode)?.name}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-10 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lock className="size-5 text-slate-500" />
                    Locked Content
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {bank.unlock_type === "paid"
                      ? `This is a paid Question Bank. Purchase for ${
                          bank.price ? `$${bank.price}` : "one-time access"
                        } to unlock.`
                      : bank.unlock_type === "referral"
                        ? "This is a special reward bank. Invite friends to StudyPilot to unlock it for free."
                        : "This is a premium Question Bank. Upgrade your account or purchase separately to access."}
                  </p>

                  {bank.unlock_type === "paid" ? (
                    <button
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-colors"
                      onClick={() => alert("Payment integration coming soon!")}
                    >
                      <DollarSign className="size-5" />
                      Purchase for {bank.price ? `$${bank.price}` : "Access"}
                    </button>
                  ) : bank.unlock_type === "referral" ? (
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
