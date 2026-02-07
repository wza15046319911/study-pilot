"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { ExportMistakesModal } from "@/components/modals/ExportMistakesModal";
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

interface MistakeData {
  id: number;
  question_id: number;
  last_wrong_answer: string | null;
  error_count: number;
  created_at: string;
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

// Stats are now handled by MistakesAnalytics component
interface MistakesClientProps {
  mistakes: MistakeData[];
  userId: string;
  isVip: boolean;
  stats?: any;
}

export default function MistakesClient({
  mistakes: initialMistakes,
  userId,
  isVip,
}: MistakesClientProps) {
  const router = useRouter();
  const [mistakes, setMistakes] = useState(initialMistakes);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const supabase = useMemo(() => createClient(), []);

  const handleRemoveMistake = async (mistakeId: number) => {
    setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
    await supabase.from("mistakes").delete().eq("id", mistakeId);
  };

  const handlePracticeAll = () => {
    if (mistakes.length === 0) return;
    const subjectIds = [
      ...new Set(mistakes.map((m) => m.questions.subject_id)),
    ];
    // If multiple subjects, just pick the first one for now as per previous logic
    // Improvements could be made to handle multi-subject practice if backend supports it
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

  // Get unique subjects for tabs
  const subjects = useMemo(() => {
    const uniqueSubjects = new Map();
    mistakes.forEach((m) => {
      if (!uniqueSubjects.has(m.questions.subject_id)) {
        uniqueSubjects.set(m.questions.subject_id, {
          id: m.questions.subject_id,
          name: m.questions.subjects.name,
          slug: m.questions.subjects.slug,
          count: 0,
        });
      }
      uniqueSubjects.get(m.questions.subject_id).count++;
    });
    return Array.from(uniqueSubjects.values());
  }, [mistakes]);

  // Filter mistakes based on search
  const filteredMistakes = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();
    if (!normalizedSearch) {
      return mistakes;
    }

    return mistakes.filter(
      (m) =>
        m.questions.title.toLowerCase().includes(normalizedSearch) ||
        m.questions.content.toLowerCase().includes(normalizedSearch),
    );
  }, [mistakes, deferredSearchQuery]);

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
          Mistakes
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Mistake Book
          </h1>
          <p className="text-gray-500 text-lg">
            Detailed breakdown of questions you&apos;ve missed.
          </p>
        </div>

        {mistakes.length > 0 && (
          <div className="flex gap-3">
            {/* <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
              className="rounded-xl border-gray-200 dark:border-gray-700"
            >
              <Download className="size-4 mr-2" />
              Export
            </Button> */}
            <Button
              onClick={handlePracticeAll}
              size="lg"
              className="rounded-xl shadow-lg shadow-blue-500/20 text-white bg-blue-600 hover:bg-blue-700"
            >
              <Play className="size-4 mr-2" />
              Practice All
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
            Clean Sheet!
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You don&apos;t have any pending mistakes to review. Keep up the
            great work!
          </p>
          <Button variant="outline" onClick={() => router.push("/library")}>
            Start New Practice
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8 h-auto flex-wrap justify-start bg-transparent p-0 gap-2">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full"
            >
              All Subjects
              <span className="ml-2 text-xs opacity-70 bg-black/10 px-1.5 py-0.5 rounded-full">
                {mistakes.length}
              </span>
            </TabsTrigger>
            {subjects.map((subject: any) => (
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

          {/* Content for All Subjects */}
          <TabsContent value="all" className="space-y-8">
            <MistakesAnalytics mistakes={mistakes} isPremium={isVip} />

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
              <Search className="size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search all mistakes..."
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
                />
              ))}
            </div>
          </TabsContent>

          {/* Content for Each Subject */}
          {subjects.map((subject: any) => {
            const subjectMistakes = filteredMistakes.filter(
              (m) => m.questions.subject_id === subject.id,
            );
            return (
              <TabsContent
                key={subject.id}
                value={subject.name}
                className="space-y-8"
              >
                <MistakesAnalytics mistakes={subjectMistakes} isPremium={isVip} />

                {/* Search (Scoped) */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <Search className="size-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${subject.name} mistakes...`}
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
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No mistakes found matching your search.
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <ExportMistakesModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mistakes={mistakes as any}
        userId={userId}
      />
    </div>
  );
}

// Sub-component for individual mistake card to keep main component clean
function MistakeCard({
  mistake,
  onRemove,
}: {
  mistake: MistakeData;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/40 transition-colors flex flex-col md:flex-row gap-6 relative group">
      <button
        onClick={() => onRemove(mistake.id)}
        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Remove from mistakes"
      >
        <Trash2 className="size-4" />
      </button>

      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded uppercase tracking-wider flex items-center gap-1.5">
            <RotateCw className="size-3" />
            {mistake.error_count} Attempts
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            {mistake.questions.title}
          </h4>
          <div className="text-sm text-gray-500 leading-relaxed mb-4">
            <LatexContent>{mistake.questions.content}</LatexContent>
          </div>
          {/* Render Options if available */}
          {(() => {
            let options: any[] = [];
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
                    const derivedLabel =
                      typeof option === "string"
                        ? String.fromCharCode(65 + idx)
                        : option?.label || String.fromCharCode(65 + idx);
                    const derivedContent =
                      typeof option === "string"
                        ? option
                        : (option?.content ??
                          option?.label ??
                          JSON.stringify(option));

                    return (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <span
                          className={`shrink-0 size-6 flex items-center justify-center rounded-full font-bold text-xs border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700`}
                        >
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
            My Answer
          </div>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 p-2 rounded border border-red-100 dark:border-red-900/20">
            {mistake.last_wrong_answer || "(No Answer)"}
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
            <CheckCircle2 className="size-3.5" />
            Correct Answer
          </div>
          <p className="font-mono text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 p-2 rounded border border-green-100 dark:border-green-900/20">
            {mistake.questions.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
