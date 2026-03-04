"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { MistakesAnalytics } from "./MistakesAnalytics";
import { encodeId } from "@/lib/ids";
import {
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCw,
  Search,
  Check,
} from "lucide-react";
import { LatexContent } from "@/components/ui/LatexContent";
import { useTranslations } from "next-intl";

const NOTE_MAX_LENGTH = 500;
const NOTE_DEBOUNCE_MS = 600;

type NoteSaveState = "saving" | "saved" | "error";

type SubjectTab = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

const ExportMistakesModal = dynamic(
  () =>
    import("@/components/modals/ExportMistakesModal").then(
      (module) => module.ExportMistakesModal,
    ),
  {
    ssr: false,
  },
);

interface MistakeData {
  id: number;
  question_id: number;
  last_wrong_answer: string | null;
  error_count: number;
  created_at: string;
  note: string | null;
  questions: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
    type: string;
    answer: string;
    options?: unknown;
    subject_id: number;
    subjects: {
      id: number;
      name: string;
      slug: string;
    };
    topics?: {
      id: number;
      name: string;
    } | null;
    tags?: string[] | null;
  };
}

interface MistakesClientProps {
  mistakes: MistakeData[];
  userId: string;
  isVip: boolean;
}

export default function MistakesClient({
  mistakes: initialMistakes,
  userId,
  isVip,
}: MistakesClientProps) {
  const t = useTranslations("profileMistakes");
  const router = useRouter();
  const [mistakes, setMistakes] = useState(initialMistakes);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mistakeNotes, setMistakeNotes] = useState<Record<number, string>>(() =>
    Object.fromEntries(initialMistakes.map((mistake) => [mistake.id, mistake.note || ""])),
  );
  const [noteSaveStates, setNoteSaveStates] = useState<
    Record<number, NoteSaveState | undefined>
  >({});
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const supabase = useMemo(() => createClient(), []);
  const noteTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const clearNoteTimer = useCallback((mistakeId: number) => {
    const timer = noteTimersRef.current[mistakeId];
    if (!timer) return;
    clearTimeout(timer);
    delete noteTimersRef.current[mistakeId];
  }, []);

  const persistNote = useCallback(
    async (mistakeId: number, noteValue: string) => {
      const normalizedNote = noteValue.trim().length === 0 ? null : noteValue;
      const { error } = await supabase
        .from("mistakes")
        .update({ note: normalizedNote } as unknown as never)
        .eq("id", mistakeId);

      if (error) {
        setNoteSaveStates((prev) => ({ ...prev, [mistakeId]: "error" }));
        return;
      }

      setMistakes((prev) =>
        prev.map((mistake) =>
          mistake.id === mistakeId ? { ...mistake, note: normalizedNote } : mistake,
        ),
      );
      setNoteSaveStates((prev) => ({ ...prev, [mistakeId]: "saved" }));
    },
    [supabase],
  );

  const handleNoteChange = useCallback(
    (mistakeId: number, value: string) => {
      const nextValue = value.slice(0, NOTE_MAX_LENGTH);
      setMistakeNotes((prev) => ({ ...prev, [mistakeId]: nextValue }));
      setNoteSaveStates((prev) => ({ ...prev, [mistakeId]: "saving" }));
      clearNoteTimer(mistakeId);
      noteTimersRef.current[mistakeId] = setTimeout(() => {
        delete noteTimersRef.current[mistakeId];
        void persistNote(mistakeId, nextValue);
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

  const handleRemoveMistake = async (mistakeId: number, questionId: number) => {
    const removedMistake = mistakes.find((mistake) => mistake.id === mistakeId);
    const removedNote = mistakeNotes[mistakeId] || "";
    clearNoteTimer(mistakeId);
    setMistakeNotes((prev) => {
      const next = { ...prev };
      delete next[mistakeId];
      return next;
    });
    setNoteSaveStates((prev) => {
      const next = { ...prev };
      delete next[mistakeId];
      return next;
    });
    setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
    const { error: deleteByIdError, count: deletedByIdCount } = await supabase
      .from("mistakes")
      .delete({ count: "exact" })
      .eq("id", mistakeId)
      .eq("user_id", userId);

    if (!deleteByIdError && (deletedByIdCount || 0) > 0) {
      return;
    }

    const { error: fallbackDeleteError, count: fallbackDeletedCount } = await supabase
      .from("mistakes")
      .delete({ count: "exact" })
      .eq("question_id", questionId)
      .eq("user_id", userId);

    if (!fallbackDeleteError && (fallbackDeletedCount || 0) > 0) {
      return;
    }

    if (removedMistake) {
      setMistakes((prev) => [removedMistake, ...prev]);
    }
    setMistakeNotes((prev) => ({ ...prev, [mistakeId]: removedNote }));
    setNoteSaveStates((prev) => ({ ...prev, [mistakeId]: "error" }));
  };

  const handlePracticeAll = () => {
    if (mistakes.length === 0) return;
    const subjectIds = [...new Set(mistakes.map((m) => m.questions.subject_id))];
    const firstSubjectId = subjectIds[0];
    const questionIds = mistakes
      .filter((m) => m.questions.subject_id === firstSubjectId)
      .map((m) => encodeId(m.question_id))
      .join(",");

    const firstMistake = mistakes.find(
      (m) => m.questions.subject_id === firstSubjectId,
    );

    if (firstMistake) {
      router.push(
        `/practice/${firstMistake.questions.subjects.slug}?mode=mistakes&questions=${questionIds}`,
      );
    }
  };

  const subjects = useMemo<SubjectTab[]>(() => {
    const uniqueSubjects = new Map<number, SubjectTab>();
    mistakes.forEach((m) => {
      if (!uniqueSubjects.has(m.questions.subject_id)) {
        uniqueSubjects.set(m.questions.subject_id, {
          id: m.questions.subject_id,
          name: m.questions.subjects.name,
          slug: m.questions.subjects.slug,
          count: 0,
        });
      }
      const subject = uniqueSubjects.get(m.questions.subject_id);
      if (subject) {
        subject.count++;
      }
    });
    return Array.from(uniqueSubjects.values());
  }, [mistakes]);

  const exportableMistakes = useMemo(
    () =>
      mistakes.map((mistake) => ({
        ...mistake,
        last_wrong_answer: mistake.last_wrong_answer || "",
      })),
    [mistakes],
  );

  const filteredMistakes = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();
    if (!normalizedSearch) {
      return mistakes;
    }

    return mistakes.filter(
      (m) =>
        m.questions.title.toLowerCase().includes(normalizedSearch) ||
        m.questions.content.toLowerCase().includes(normalizedSearch) ||
        (mistakeNotes[m.id] || "").toLowerCase().includes(normalizedSearch),
    );
  }, [mistakeNotes, mistakes, deferredSearchQuery]);

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          {t("breadcrumb.mistakes")}
        </span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-500 text-lg">{t("subtitle")}</p>
        </div>

        {mistakes.length > 0 && (
          <div className="flex gap-3">
            <Button
              onClick={handlePracticeAll}
              size="lg"
              className="rounded-xl shadow-lg shadow-blue-500/20 text-white bg-blue-600 hover:bg-blue-700"
            >
              <Play className="size-4 mr-2" />
              {t("practiceAll")}
            </Button>
          </div>
        )}
      </div>

      {mistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <div className="size-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="size-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t("empty.title")}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">{t("empty.description")}</p>
          <Button variant="outline" onClick={() => router.push("/library")}>
            {t("empty.cta")}
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8 h-auto flex-wrap justify-start bg-transparent p-0 gap-2">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full"
            >
              {t("tabs.allSubjects")}
              <span className="ml-2 text-xs opacity-70 bg-black/10 px-1.5 py-0.5 rounded-full">
                {mistakes.length}
              </span>
            </TabsTrigger>
            {subjects.map((subject) => (
              <TabsTrigger
                key={subject.id}
                value={subject.name}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full"
              >
                {subject.name}
                <span className="ml-2 text-xs opacity-70 bg-black/10 px-1.5 py-0.5 rounded-full">
                  {subject.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            <MistakesAnalytics mistakes={mistakes} isPremium={isVip} />

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
              <Search className="size-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("search.allPlaceholder")}
                className="bg-transparent flex-1 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid gap-6">
              {filteredMistakes.map((mistake) => (
                <MistakeCard
                  key={mistake.id}
                  mistake={mistake}
                  onRemove={handleRemoveMistake}
                  noteValue={mistakeNotes[mistake.id] || ""}
                  noteState={noteSaveStates[mistake.id]}
                  onNoteChange={handleNoteChange}
                  t={t}
                />
              ))}
            </div>
          </TabsContent>

          {subjects.map((subject) => {
            const subjectMistakes = filteredMistakes.filter(
              (m) => m.questions.subject_id === subject.id,
            );
            return (
              <TabsContent key={subject.id} value={subject.name} className="space-y-8">
                <MistakesAnalytics mistakes={subjectMistakes} isPremium={isVip} />

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <Search className="size-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("search.scopedPlaceholder", {
                      subject: subject.name,
                    })}
                    className="bg-transparent flex-1 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid gap-6">
                  {subjectMistakes.length > 0 ? (
                    subjectMistakes.map((mistake) => (
                      <MistakeCard
                        key={mistake.id}
                        mistake={mistake}
                        onRemove={handleRemoveMistake}
                        noteValue={mistakeNotes[mistake.id] || ""}
                        noteState={noteSaveStates[mistake.id]}
                        onNoteChange={handleNoteChange}
                        t={t}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      {t("search.noResults")}
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {showExportModal ? (
        <ExportMistakesModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          mistakes={exportableMistakes}
          userId={userId}
        />
      ) : null}
    </div>
  );
}

function MistakeCard({
  mistake,
  onRemove,
  noteValue,
  noteState,
  onNoteChange,
  t,
}: {
  mistake: MistakeData;
  onRemove: (id: number, questionId: number) => void;
  noteValue: string;
  noteState?: NoteSaveState;
  onNoteChange: (id: number, value: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/40 transition-colors flex flex-col md:flex-row gap-6 relative group">
      <button
        onClick={() => onRemove(mistake.id, mistake.question_id)}
        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title={t("remove")}
      >
        <Trash2 className="size-4" />
      </button>

      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
            <RotateCw className="size-3" />
            {t("attempts", { count: mistake.error_count })}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            {mistake.questions.title}
          </h4>
          <div className="text-sm text-gray-500 leading-relaxed mb-4">
            <LatexContent>{mistake.questions.content}</LatexContent>
          </div>
          {(() => {
            let options: unknown[] = [];
            if (Array.isArray(mistake.questions.options)) {
              options = mistake.questions.options;
            } else if (
              typeof mistake.questions.options === "string" &&
              mistake.questions.options
            ) {
              try {
                options = JSON.parse(mistake.questions.options);
              } catch (e) {
                console.error("Failed to parse options", e);
              }
            }

            if (options && options.length > 0) {
              return (
                <div className="space-y-2 mt-4 pl-1">
                  {options.map((option, idx) => {
                    const parsedOption =
                      typeof option === "object" && option
                        ? (option as { label?: string; content?: string })
                        : null;
                    const derivedLabel =
                      typeof option === "string"
                        ? String.fromCharCode(65 + idx)
                        : parsedOption?.label || String.fromCharCode(65 + idx);
                    const derivedContent =
                      typeof option === "string"
                        ? option
                        : (parsedOption?.content ??
                          parsedOption?.label ??
                          JSON.stringify(option));

                    return (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <span className="shrink-0 size-6 flex items-center justify-center rounded-full font-bold text-xs border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          {derivedLabel}
                        </span>
                        <div className="flex-1 text-gray-600 dark:text-gray-400">
                          <LatexContent>{derivedContent}</LatexContent>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      <div className="flex-1 md:max-w-md bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 border border-gray-100 dark:border-gray-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
            <XCircle className="size-3.5" />
            {t("labels.myAnswer")}
          </div>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 p-2 rounded border border-red-100 dark:border-red-900/20">
            {mistake.last_wrong_answer || t("labels.noAnswer")}
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
            <CheckCircle2 className="size-3.5" />
            {t("labels.correctAnswer")}
          </div>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 p-2 rounded border border-green-100 dark:border-green-900/20">
            {mistake.questions.answer}
          </p>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
              {t("noteLabel")}
            </span>
            <span className="text-xs text-gray-400">
              {t("noteLimit", { count: noteValue.length })}
            </span>
          </div>
          <textarea
            value={noteValue}
            onChange={(e) => onNoteChange(mistake.id, e.target.value)}
            placeholder={t("notePlaceholder")}
            className="w-full min-h-[90px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          />
          <div className="text-xs">
            {noteState === "saving" ? (
              <span className="text-gray-400">{t("noteSaving")}</span>
            ) : noteState === "saved" ? (
              <span className="text-green-600 dark:text-green-400">{t("noteSaved")}</span>
            ) : noteState === "error" ? (
              <span className="text-red-500">{t("noteSaveError")}</span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
