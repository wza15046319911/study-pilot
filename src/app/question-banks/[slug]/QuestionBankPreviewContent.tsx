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
  Info,
  BookOpen,
  Brain,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { toggleQuestionBankCollection } from "@/app/library/actions";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { slugOrEncodedId } from "@/lib/ids";

interface QuestionBankPreviewContentProps {
  bank: any;
  user: any;
  difficultyCounts: any;
  sortedTopics: [string, unknown][];
  totalQuestions: number;
  isUnlocked: boolean;
  unlockReason: string;
  isCollected: boolean;
  allowedModes?: string[];
  libraryContext?: {
    subjectSlug: string;
    subjectName: string;
    subjectIcon?: string;
  };
}

const allModes = [
  {
    id: "standard",
    routeSegment: "practice", // URL path segment: /practice
    name: "Standard",
    description: "Practice with custom filters. Track progress.",
    icon: ListChecks,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    ringColor: "ring-blue-500",
  },
  {
    id: "immersive",
    routeSegment: "immersive",
    name: "Immersive",
    description: "Focused, distraction-free practice.",
    icon: Brain,
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-900/20",
    borderColor: "border-violet-200 dark:border-violet-800",
    ringColor: "ring-violet-500",
  },
  {
    id: "flashcard",
    routeSegment: "flashcards",
    name: "Flashcard",
    description: "Spaced repetition review.",
    icon: GraduationCap,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    ringColor: "ring-emerald-500",
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
  allowedModes = ["standard", "immersive", "flashcard"],
  libraryContext,
}: QuestionBankPreviewContentProps) {
  // Filter modes based on what's allowed
  const modes = allModes.filter((m) => allowedModes.includes(m.id));

  // Default to first allowed mode
  const [selectedMode, setSelectedMode] = useState(
    modes.length > 0 ? modes[0].id : "standard",
  );
  const activeUsers = ((bank.id * 7) % 40) + 12;
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
    const routeId = bank.routeId || slugOrEncodedId(bank.slug, bank.id);
    const basePath = libraryContext
      ? `/library/${libraryContext.subjectSlug}/question-banks/${routeId}`
      : `/question-banks/${routeId}`;

    const selectedModeObj = modes.find((m) => m.id === selectedMode);
    const routeSegment = selectedModeObj?.routeSegment || "practice";
    return `${basePath}/${routeSegment}`;
  };

  // Dynamic icon based on subject context or default
  const IconComponent = libraryContext?.subjectIcon ? (
    <span className="text-6xl">{libraryContext.subjectIcon}</span>
  ) : (
    <BookOpen className="size-20 text-blue-500" />
  );

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
          {libraryContext && (
            <>
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
            </>
          )}
          <span className="text-slate-500 dark:text-slate-400">Question Bank</span>
          <ChevronRight className="size-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {bank.title}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Column: Visual Identity & Quick Actions */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <GlassPanel className="w-full aspect-[3/4] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 mb-6 p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
                {IconComponent}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">
                {bank.title}
              </h2>

              <div className="mt-4 flex items-center gap-2 relative z-10">
                {bank.unlock_type === "paid" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    <DollarSign className="size-3" />{" "}
                    {bank.price ? `$${bank.price}` : "Paid"}
                  </div>
                ) : bank.unlock_type === "referral" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Gift className="size-3" /> Invite
                  </div>
                ) : bank.is_premium ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Crown className="size-3" /> Premium
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Star className="size-3" /> Public
                  </div>
                )}
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
                    {activeUsers}
                  </div>
                  <div className="text-[14px] uppercase tracking-wider font-bold text-slate-400">
                    Active Users
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Right Column: Details & Enrollment */}
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

            {/* Action Area: Enrollment or Practice */}
            <div className="mb-12">
              {!collected ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 rotate-12">
                    <BookmarkCheck className="size-64" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Ready to start practicing?
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-lg">
                      You must enrol in this question bank to track your
                      progress, save mistakes, and access all practice modes.
                    </p>

                    <Button
                      onClick={handleToggleCollection}
                      disabled={isPending}
                      size="lg"
                      className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPending ? (
                        "Enrolling..."
                      ) : (
                        <>
                          <Bookmark className="size-5 mr-2" />
                          Enrol to Start Practice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {isUnlocked ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                          Select Practice Mode
                        </h3>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                          <Check className="size-3.5" /> Enrolled
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {modes.map((m) => {
                          const Icon = m.icon;
                          const isSelected = selectedMode === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMode(m.id)}
                              className={cn(
                                "group relative p-4 text-left rounded-xl transition-all duration-300 border-2",
                                isSelected
                                  ? `bg-white dark:bg-slate-800 ${m.borderColor} ${m.ringColor} ring-1 shadow-lg`
                                  : "bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700",
                              )}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className={cn(
                                    "p-2 rounded-lg",
                                    isSelected
                                      ? m.bgColor
                                      : "bg-slate-100 dark:bg-slate-800",
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "size-4",
                                      isSelected ? m.color : "text-slate-500",
                                    )}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    "font-bold text-sm",
                                    isSelected
                                      ? "text-slate-900 dark:text-white"
                                      : "text-slate-600",
                                  )}
                                >
                                  {m.name}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-tight">
                                {m.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <Link
                          href={getStartLink()}
                          className="flex-1 sm:flex-none"
                        >
                          <Button
                            size="lg"
                            className="w-full sm:w-auto min-w-[200px] text-lg rounded-xl shadow-xl shadow-blue-500/20"
                          >
                            <Play className="size-5 mr-2 fill-current" />
                            Start{" "}
                            {modes.find((m) => m.id === selectedMode)?.name}
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          onClick={handleToggleCollection}
                          disabled={isPending}
                          className="w-full sm:w-auto border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <BookmarkCheck className="size-4 mr-2" />
                          Unenroll
                        </Button>
                      </div>
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
                          onClick={() =>
                            alert("Payment integration coming soon!")
                          }
                        >
                          <DollarSign className="size-5" />
                          Purchase for{" "}
                          {bank.price ? `$${bank.price}` : "Access"}
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
              )}
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
          </div>
        </div>
      </main>
    </div>
  );
}
