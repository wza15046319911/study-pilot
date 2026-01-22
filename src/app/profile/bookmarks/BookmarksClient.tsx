"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import {
  Bookmark,
  Trash2,
  Play,
  BookOpen,
  ChevronRight,
  Search,
  Clock,
  ArrowRight,
} from "lucide-react";
import { encodeId } from "@/lib/ids";
import { Subject, Question } from "@/types/database";

interface BookmarkData {
  id: number;
  question_id: number;
  created_at: string;
  questions: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
    type: string;
    subject_id: number;
    subjects: {
      id: number;
      name: string;
    };
  };
}

interface BookmarksClientProps {
  bookmarks: BookmarkData[];
  userId: string;
}

export default function BookmarksClient({
  bookmarks: initialBookmarks,
  userId,
}: BookmarksClientProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const handleRemoveBookmark = async (bookmarkId: number) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    await supabase.from("bookmarks").delete().eq("id", bookmarkId);
  };

  const handlePracticeAll = () => {
    if (bookmarks.length === 0) return;
    const subjectIds = [
      ...new Set(bookmarks.map((b) => b.questions.subject_id)),
    ];
    const firstSubjectId = subjectIds[0];
    const questionIds = bookmarks
      .filter((b) => b.questions.subject_id === firstSubjectId)
      .map((b) => b.question_id)
      .join(",");

    router.push(
      `/practice/${firstSubjectId}?mode=bookmarks&questions=${questionIds}`
    );
  };

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.questions.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.questions.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedBySubject = filteredBookmarks.reduce((acc, bookmark) => {
    const subjectName = bookmark.questions.subjects.name;
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkData[]>);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/profile" className="hover:text-blue-600 transition-colors">
          Profile
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-gray-900 dark:text-white font-medium">
          Bookmarks
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 mb-4">
            <Bookmark className="size-3.5 text-amber-600 dark:text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              Saved Items
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            My Bookmarks
          </h1>
          <p className="text-gray-500 text-lg">
            Manage questions you've saved for later review.
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Button
            onClick={handlePracticeAll}
            size="lg"
            className="rounded-xl shadow-lg shadow-blue-500/20"
          >
            <Play className="size-4 mr-2" />
            Practice All
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      {bookmarks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 flex items-center gap-4">
          <Search className="size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            className="bg-transparent flex-1 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-gray-400 font-medium">
            {filteredBookmarks.length} found
          </div>
        </div>
      )}

      {/* Content */}
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <div className="size-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="size-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No bookmarks yet
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            When you encounter a question you want to review later, click the
            bookmark icon to save it here.
          </p>
          <Button variant="outline" onClick={() => router.push("/library")}>
            Explore Library
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedBySubject).map(([subjectName, items]) => (
            <div key={subjectName}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                {subjectName}
                <span className="text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </h3>

              <div className="grid gap-4">
                {items.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer relative"
                    onClick={() =>
                      router.push(
                        `/question/${encodeId(bookmark.questions.id)}`
                      )
                    }
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              bookmark.questions.difficulty === "hard"
                                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                : bookmark.questions.difficulty === "medium"
                                ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            }`}
                          >
                            {bookmark.questions.difficulty}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="size-3" />
                            Saved {formatTimeAgo(bookmark.created_at)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                          {bookmark.questions.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {bookmark.questions.content}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(bookmark.id);
                          }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="size-5" />
                        </button>
                        <div className="p-2 text-gray-300 group-hover:text-blue-500 transition-colors mt-auto">
                          <ArrowRight className="size-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-[transform,opacity]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
