"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, Trash2, Play, BookOpen } from "lucide-react";
import { encodeId } from "@/lib/ids";

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
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleRemoveBookmark = async (bookmarkId: number) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));

    await supabase.from("bookmarks").delete().eq("id", bookmarkId);
  };

  const handlePracticeAll = () => {
    if (bookmarks.length === 0) return;

    // Get unique subject IDs
    const subjectIds = [
      ...new Set(bookmarks.map((b) => b.questions.subject_id)),
    ];

    // For simplicity, we'll practice the first subject's bookmarked questions
    // A more advanced implementation could support cross-subject practice
    const firstSubjectId = subjectIds[0];
    const questionIds = bookmarks
      .filter((b) => b.questions.subject_id === firstSubjectId)
      .map((b) => b.question_id)
      .join(",");

    router.push(
      `/practice/${firstSubjectId}?mode=bookmarks&questions=${questionIds}`
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-600";
      case "medium":
        return "bg-yellow-100 text-yellow-600";
      case "hard":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Group by subject
  const groupedBySubject = bookmarks.reduce((acc, bookmark) => {
    const subjectName = bookmark.questions.subjects.name;
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(bookmark);
    return acc;
  }, {} as Record<string, BookmarkData[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
              <Bookmark className="size-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
                Bookmarks
              </h1>
              <p className="text-[#4c669a]">
                {bookmarks.length} saved question{bookmarks.length !== 1 && "s"}
              </p>
            </div>
          </div>

          {bookmarks.length > 0 && (
            <Button onClick={handlePracticeAll} size="lg">
              <Play className="size-4 mr-2" />
              Practice All
            </Button>
          )}
        </div>

        {/* Content */}
        {bookmarks.length === 0 ? (
          <GlassPanel className="p-12 text-center">
            <BookOpen className="size-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              No bookmarks yet
            </h2>
            <p className="text-gray-400 mb-6">
              Bookmark questions during practice to review them later.
            </p>
            <Button
              variant="secondary"
              onClick={() => router.push("/subjects")}
            >
              Start Practicing
            </Button>
          </GlassPanel>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedBySubject).map(([subjectName, items]) => (
              <div key={subjectName}>
                <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#135bec]" />
                  {subjectName}
                  <span className="text-sm font-normal text-gray-400">
                    ({items.length})
                  </span>
                </h2>

                <div className="space-y-3">
                  {items.map((bookmark) => (
                    <GlassPanel
                      key={bookmark.id}
                      className="p-4 flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() =>
                        router.push(
                          `/question/${encodeId(bookmark.questions.id)}`
                        )
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(
                              bookmark.questions.difficulty
                            )}`}
                          >
                            {bookmark.questions.difficulty}
                          </span>
                          <span className="text-xs text-gray-400">
                            {bookmark.questions.type.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-medium text-[#0d121b] dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {bookmark.questions.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-3">
                          {bookmark.questions.content}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBookmark(bookmark.id);
                        }}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove bookmark"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
