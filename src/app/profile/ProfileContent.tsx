"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Profile,
  UserProgress,
  Subject,
  Mistake,
  Question,
} from "@/types/database";
import {
  Check,
  Edit2,
  AlertCircle,
  RotateCw,
  Clock,
  BookMarked,
  ChevronRight,
  TrendingUp,
  Users,
  Flame,
  FileText,
  Target,
  Layers,
} from "lucide-react";

// Combined types for props
interface ProgressWithSubject extends UserProgress {
  subjects: Subject;
}

interface MistakeWithQuestion extends Mistake {
  questions: Question;
}

interface BookmarkWithQuestion {
  id: number;
  question_id: number;
  created_at: string;
  questions: Question;
}

interface ProfileContentProps {
  user: Profile;
  progress: ProgressWithSubject[];
  mistakes: MistakeWithQuestion[];
  bookmarks: BookmarkWithQuestion[];
  answerStats: {
    total: number;
    correct: number;
    accuracy: number;
  };
  referralStats: {
    totalReferrals: number;
    unusedReferrals: number;
    unlockedBanks: number;
  };
  accessibleBanks: Array<{
    id: number;
    title: string;
    slug: string | null;
    subjects: Subject;
    is_premium: boolean;
    unlock_type: "free" | "premium" | "referral" | "paid";
    access_status: "Free" | "Unlocked" | "Premium";
  }>;
  isAdmin?: boolean;
}

export function ProfileContent({
  user,
  progress,
  mistakes,
  bookmarks,
  answerStats,
  referralStats,
  accessibleBanks,
  isAdmin = false,
}: ProfileContentProps) {
  // Calculate stats
  // unused for now: const totalCompleted = progress.reduce((acc, curr) => acc + (curr.completed_count || 0), 0);

  // Format progress data for display
  const progressDisplay = progress.map((p) => {
    const total = p.subjects.question_count || 0;
    const completed = p.completed_count || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      subject: p.subjects.name,
      slug: p.subjects.slug,
      completed,
      total,
      percentage,
      color: p.subjects.category === "STEM" ? "blue" : "emerald",
    };
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header / Breadcrumb - consistent with other pages */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-gray-900 dark:text-white font-medium">
          Profile
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="size-32 rounded-full p-1 bg-white dark:bg-slate-800 ring-2 ring-gray-100 dark:ring-gray-700">
                  <div
                    className="size-full rounded-full bg-gray-100 dark:bg-gray-800 bg-cover bg-center"
                    style={
                      user.avatar_url
                        ? { backgroundImage: `url(${user.avatar_url})` }
                        : undefined
                    }
                  >
                    {!user.avatar_url && (
                      <span className="flex items-center justify-center h-full text-4xl font-bold text-gray-300">
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 p-1.5 bg-white dark:bg-slate-900 rounded-full">
                  <div className="size-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user.username || "User"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Level {user.level || 1} • Member since{" "}
                {new Date(user.created_at).getFullYear()}
              </p>

              <div className="w-full mb-8 py-4 border-t border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-around text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1 text-orange-500">
                      <Flame className="size-4 fill-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                      {user.streak_days || 0}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Day Streak
                    </div>
                  </div>

                  <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />

                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1 text-blue-500">
                      <FileText className="size-4" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                      {answerStats.total}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Questions
                    </div>
                  </div>

                  <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />

                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1 text-green-500">
                      <Target className="size-4" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                      {answerStats.accuracy}%
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Accuracy
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
              >
                <Edit2 className="mr-2 size-4" />
                Edit Profile
              </Button>

              {isAdmin && (
                <div className="w-full mt-4">
                  <Link href="/admin">
                    <Button
                      variant="primary"
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700"
                    >
                      <Layers className="mr-2 size-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>
              )}

              {/* Referrals Section */}
              <div className="w-full mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Referrals
                  </h3>
                  <Link
                    href="/profile/referrals"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    View Details
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm">
                      <Users className="size-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                        {referralStats.totalReferrals}
                      </div>
                      <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-bold uppercase tracking-wider mt-1">
                        Friends Invited
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    You have{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {referralStats.unusedReferrals}
                    </span>{" "}
                    unlocks available. Invite more friends to unlock premium
                    Question Banks!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Learning Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <TrendingUp className="size-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Learning Progress
                </h2>
              </div>
              <Link
                href="/library"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="space-y-6">
              {progressDisplay.length > 0 ? (
                progressDisplay.map((item, i) => (
                  <Link
                    href={`/library/${item.slug}/setup`}
                    key={i}
                    className="block group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {item.subject}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.percentage === 100
                            ? "bg-green-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No progress recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {/* Mistake Book */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    <AlertCircle className="size-5" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Mistakes
                  </h2>
                </div>
                <Link
                  href="/profile/mistakes"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Manage
                </Link>
              </div>

              <div className="flex-1 space-y-4">
                {mistakes.length > 0 ? (
                  mistakes.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group cursor-pointer border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-md">
                          {item.error_count} Errors
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatTimeAgo(item.last_error_at)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                        {item.questions.title}
                      </h3>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
                    <div className="size-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                      <Check className="size-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Clean Sheet!
                    </p>
                    <p className="text-xs text-gray-500">
                      No mistakes to review.
                    </p>
                  </div>
                )}
              </div>
              {mistakes.length > 3 && (
                <Link
                  href="/profile/mistakes"
                  className="mt-6 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View {mistakes.length - 3} more
                </Link>
              )}
            </div>

            {/* Bookmarks */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <BookMarked className="size-5" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Bookmarks
                  </h2>
                </div>
                <Link
                  href="/profile/bookmarks"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Manage
                </Link>
              </div>

              <div className="flex-1 space-y-4">
                {bookmarks.length > 0 ? (
                  bookmarks.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors group cursor-pointer border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        {/* Difficulty Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            item.questions.difficulty === "hard"
                              ? "bg-red-100 text-red-700"
                              : item.questions.difficulty === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.questions.difficulty}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatTimeAgo(item.created_at)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                        {item.questions.title}
                      </h3>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 text-center space-y-3">
                    <BookMarked className="size-10 text-gray-200 dark:text-gray-700" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        No bookmarks
                      </p>
                      <p className="text-xs text-gray-500">
                        Save questions to review later.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {bookmarks.length > 3 && (
                <Link
                  href="/profile/bookmarks"
                  className="mt-6 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View {bookmarks.length - 3} more
                </Link>
              )}
            </div>
          </div>

          {/* My Question Banks */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                My Question Banks
              </h2>
              <Link
                href="/library"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Explore More
              </Link>
            </div>

            {accessibleBanks.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {accessibleBanks.map((bank) => (
                  <Link
                    href={`/library/${bank.subjects?.slug}/question-banks/${bank.slug}`}
                    key={bank.id}
                    className="block p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {bank.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{bank.subjects?.name || "Subject"}</span>
                        </div>
                      </div>

                      <span
                        className={`
                         text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider
                         ${
                           bank.access_status === "Free"
                             ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                             : bank.access_status === "Premium"
                             ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                             : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                         }
                       `}
                      >
                        {bank.access_status === "Premium" && user.is_vip
                          ? "VIP Access"
                          : bank.access_status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You haven't unlocked any question banks yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
