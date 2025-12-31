"use client";

import React from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
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
  CheckCircle2,
  Edit2,
  AlertCircle,
  RotateCw,
  Clock,
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
}

export function ProfileContent({
  user,
  progress,
  mistakes,
  bookmarks,
}: ProfileContentProps) {
  // Calculate stats
  const totalCompleted = progress.reduce(
    (acc, curr) => acc + (curr.completed_count || 0),
    0
  );

  // Format progress data for display
  const progressDisplay = progress.map((p) => {
    const total = p.subjects.question_count || 0;
    const completed = p.completed_count || 0;
    // Avoid division by zero
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      subject: p.subjects.name,
      completed,
      total,
      percentage,
      color: p.subjects.category === "STEM" ? "blue" : "green",
    };
  });

  // Format relative time (simple implementation)
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column - Profile Card */}
      <div className="lg:col-span-1">
        <GlassPanel className="p-8 text-center h-full">
          {/* Avatar */}
          <div className="relative mx-auto mb-6">
            <div className="size-24 rounded-full bg-gradient-to-br from-[#135bec] to-purple-500 p-1">
              <div
                className="size-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 bg-cover bg-center"
                style={
                  user.avatar_url
                    ? { backgroundImage: `url(${user.avatar_url})` }
                    : undefined
                }
              />
            </div>
            <div className="absolute bottom-0 right-0 size-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
              <Check className="text-white size-3.5" />
            </div>
          </div>

          {/* User Info */}
          <h1 className="text-2xl font-bold mb-6">{user.username || "User"}</h1>

          <Button variant="secondary" className="w-full">
            <Edit2 className="mr-2 size-4" />
            Edit Profile
          </Button>
        </GlassPanel>
      </div>

      {/* Right Column - Progress, Mistakes, Bookmarks */}
      <div className="lg:col-span-2 space-y-8">
        {/* Learning Progress */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Learning Progress</h2>
            <Link
              href="/subjects"
              className="text-[#135bec] text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>

          {progressDisplay.length > 0 ? (
            <div className="space-y-5">
              {progressDisplay.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.subject}</span>
                    <span className="text-sm text-[#4c669a]">
                      {item.completed}/{item.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        item.percentage === 100
                          ? "bg-green-500"
                          : item.percentage > 50
                          ? "bg-[#135bec]"
                          : "bg-orange-400"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#4c669a]">
              <p>No progress yet. Start practicing!</p>
              <Link href="/subjects">
                <Button className="mt-4" size="sm">
                  Start Learning
                </Button>
              </Link>
            </div>
          )}
        </GlassPanel>

        {/* Mistake Book */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Mistake Book</h2>
              <span className="text-sm text-[#4c669a] bg-gray-100 px-2 py-0.5 rounded-full">
                {mistakes.length} recent
              </span>
            </div>
            <Link
              href="/profile/mistakes"
              className="text-[#135bec] text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>

          {mistakes.length > 0 ? (
            <div className="space-y-4">
              {mistakes.map((mistake) => (
                <div
                  key={mistake.id}
                  className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:border-[#135bec]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                      <AlertCircle className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">
                        {mistake.questions.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#4c669a] mt-1">
                        <span className="flex items-center gap-1">
                          <RotateCw className="size-3.5" />
                          {mistake.error_count} errors
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {formatTimeAgo(mistake.last_error_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/profile/mistakes">
                    <Button variant="secondary" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#4c669a]">
              <CheckCircle2 className="size-10 mb-2 text-green-500 mx-auto" />
              <p>Great job! No mistakes found.</p>
            </div>
          )}
        </GlassPanel>

        {/* Bookmarks - New Section */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Bookmarks</h2>
              <span className="text-sm text-[#4c669a] bg-gray-100 px-2 py-0.5 rounded-full">
                {bookmarks.length} recent
              </span>
            </div>
            <Link
              href="/profile/bookmarks"
              className="text-[#135bec] text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>

          {bookmarks.length > 0 ? (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 hover:border-[#135bec]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">
                        {bookmark.questions.title}
                      </p>
                      <p className="text-xs text-[#4c669a] mt-1">
                        Added {formatTimeAgo(bookmark.created_at)}
                      </p>
                    </div>
                  </div>
                  <Link href="/profile/bookmarks">
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#4c669a]">
              <p>No bookmarks yet.</p>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
