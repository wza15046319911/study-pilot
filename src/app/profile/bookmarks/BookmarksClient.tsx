"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
import { useTranslations } from "next-intl";

const NOTE_MAX_LENGTH = 500;
const NOTE_DEBOUNCE_MS = 600;

type NoteSaveState = "saving" | "saved" | "error";

interface BookmarkData {
  id: number;
  question_id: number;
  created_at: string;
  note: string | null;
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
}

export default function BookmarksClient({
  bookmarks: initialBookmarks,
}: BookmarksClientProps) {
  const t = useTranslations("profileBookmarks");
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkNotes, setBookmarkNotes] = useState<Record<number, string>>(() =>
    Object.fromEntries(initialBookmarks.map((bookmark) => [bookmark.id, bookmark.note || "" ])),
  );
  const [noteSaveStates, setNoteSaveStates] = useState<
    Record<number, NoteSaveState | undefined>
  >({});
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const supabase = useMemo(() => createClient(), []);
  const noteTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const clearNoteTimer = useCallback((bookmarkId: number) => {
    const timer = noteTimersRef.current[bookmarkId];
    if (!timer) return;
    clearTimeout(timer);
    delete noteTimersRef.current[bookmarkId];
  }, []);

  const persistNote = useCallback(
    async (bookmarkId: number, noteValue: string) => {
      const normalizedNote = noteValue.trim().length === 0 ? null : noteValue;
      const { error } = await supabase
        .from("bookmarks")
        .update({ note: normalizedNote } as unknown as never)
        .eq("id", bookmarkId);

      if (error) {
        setNoteSaveStates((prev) => ({ ...prev, [bookmarkId]: "error" }));
        return;
      }

      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.id === bookmarkId ? { ...bookmark, note: normalizedNote } : bookmark,
        ),
      );
      setNoteSaveStates((prev) => ({ ...prev, [bookmarkId]: "saved" }));
    },
    [supabase],
  );

  const handleNoteChange = useCallback(
    (bookmarkId: number, value: string) => {
      const nextValue = value.slice(0, NOTE_MAX_LENGTH);
      setBookmarkNotes((prev) => ({ ...prev, [bookmarkId]: nextValue }));
      setNoteSaveStates((prev) => ({ ...prev, [bookmarkId]: "saving" }));
      clearNoteTimer(bookmarkId);
      noteTimersRef.current[bookmarkId] = setTimeout(() => {
        delete noteTimersRef.current[bookmarkId];
        void persistNote(bookmarkId, nextValue);
      }, NOTE_DEBOUNCE_MS);
    },
    [clearNoteTimer, persistNote],
  );

  useEffect(() => {
    const noteTimers = noteTimersRef.current;
    return () => {
      Object.values(noteTimers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleRemoveBookmark = async (bookmarkId: number) => {
    clearNoteTimer(bookmarkId);
    setBookmarkNotes((prev) => {
      const next = { ...prev };
      delete next[bookmarkId];
      return next;
    });
    setNoteSaveStates((prev) => {
      const next = { ...prev };
      delete next[bookmarkId];
      return next;
    });
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
      `/practice/${encodeId(firstSubjectId)}?mode=bookmarks&questions=${questionIds}`,
    );
  };

  const filteredBookmarks = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();
    if (!normalizedSearch) {
      return bookmarks;
    }

    return bookmarks.filter(
      (bookmark) =>
        bookmark.questions.title.toLowerCase().includes(normalizedSearch) ||
        bookmark.questions.content.toLowerCase().includes(normalizedSearch) ||
        (bookmarkNotes[bookmark.id] || "").toLowerCase().includes(normalizedSearch),
    );
  }, [bookmarks, bookmarkNotes, deferredSearchQuery]);

  const groupedBySubject = useMemo(() => {
    return filteredBookmarks.reduce(
      (acc, bookmark) => {
        const subjectName = bookmark.questions.subjects.name;
        if (!acc[subjectName]) acc[subjectName] = [];
        acc[subjectName].push(bookmark);
        return acc;
      },
      {} as Record<string, BookmarkData[]>,
    );
  }, [filteredBookmarks]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 3600 * 24),
    );

    if (diffInDays === 0) return t("time.today");
    if (diffInDays === 1) return t("time.yesterday");
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
          {t("breadcrumb.home")}
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/profile" className="hover:text-blue-600 transition-colors">
          {t("breadcrumb.profile")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-gray-900 dark:text-white font-medium">
          {t("breadcrumb.bookmarks")}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 mb-4">
            <Bookmark className="size-3.5 text-amber-600 dark:text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              {t("savedItems")}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-500 text-lg">
            {t("subtitle")}
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Button
            onClick={handlePracticeAll}
            size="lg"
            className="rounded-xl shadow-lg shadow-blue-500/20"
          >
            <Play className="size-4 mr-2" />
            {t("practiceAll")}
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      {bookmarks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 flex items-center gap-4">
          <Search className="size-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="bg-transparent flex-1 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-gray-400 font-medium">
            {t("foundCount", { count: filteredBookmarks.length })}
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
            {t("empty.title")}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            {t("empty.description")}
          </p>
          <Button variant="outline" onClick={() => router.push("/library")}>
            {t("empty.cta")}
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
                        `/question/${encodeId(bookmark.questions.id)}`,
                      )
                    }
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-[14px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
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
                            {t("savedAt", { time: formatTimeAgo(bookmark.created_at) })}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                          {bookmark.questions.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {bookmark.questions.content}
                        </p>
                        <div
                          className="mt-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor={`bookmark-note-${bookmark.id}`}
                              className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide"
                            >
                              {t("noteLabel")}
                            </label>
                            <span className="text-xs text-gray-400">
                              {t("noteLimit", {
                                count: (bookmarkNotes[bookmark.id] || "").length,
                              })}
                            </span>
                          </div>
                          <textarea
                            id={`bookmark-note-${bookmark.id}`}
                            value={bookmarkNotes[bookmark.id] || ""}
                            onChange={(e) =>
                              handleNoteChange(bookmark.id, e.target.value)
                            }
                            placeholder={t("notePlaceholder")}
                            className="w-full min-h-[92px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                          />
                          <div className="text-xs mt-1.5">
                            {noteSaveStates[bookmark.id] === "saving" ? (
                              <span className="text-gray-400">{t("noteSaving")}</span>
                            ) : noteSaveStates[bookmark.id] === "saved" ? (
                              <span className="text-green-600 dark:text-green-400">
                                {t("noteSaved")}
                              </span>
                            ) : noteSaveStates[bookmark.id] === "error" ? (
                              <span className="text-red-500">{t("noteSaveError")}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBookmark(bookmark.id);
                          }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t("removeBookmark")}
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
