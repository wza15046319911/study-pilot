"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { ExportMistakesModal } from "@/components/modals/ExportMistakesModal";
import { encodeId } from "@/lib/ids";
import {
  AlertTriangle,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Download,
  ChevronRight,
  RotateCw,
  Search,
  Check,
  Zap,
  BookOpen,
  Hash
} from "lucide-react";

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

interface MistakeStats {
  totalMistakes: number;
  topTopic?: { name: string; count: number };
  topTags: { tag: string; count: number }[];
}

interface MistakesClientProps {
  mistakes: MistakeData[];
  userId: string;
  stats: MistakeStats;
}

export default function MistakesClient({
  mistakes: initialMistakes,
  userId,
  stats,
}: MistakesClientProps) {
  const router = useRouter();
  const [mistakes, setMistakes] = useState(initialMistakes);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const handleRemoveMistake = async (mistakeId: number) => {
    setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
    await supabase.from("mistakes").delete().eq("id", mistakeId);
  };

  const handlePracticeAll = () => {
    if (mistakes.length === 0) return;
    const subjectIds = [
      ...new Set(mistakes.map((m) => m.questions.subject_id)),
    ];
    const firstSubjectId = subjectIds[0];
    const questionIds = mistakes
      .filter((m) => m.questions.subject_id === firstSubjectId)
      .map((m) => encodeId(m.question_id))
      .join(",");

    const firstMistake = mistakes.find(
      (m) => m.questions.subject_id === firstSubjectId
    );

    if (firstMistake) {
      router.push(
        `/practice/${firstMistake.questions.subjects.slug}?mode=mistakes&questions=${questionIds}`
      );
    }
  };

  const filteredMistakes = mistakes.filter(
    (m) =>
      m.questions.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.questions.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedBySubject = filteredMistakes.reduce((acc, mistake) => {
    const subjectName = mistake.questions.subjects.name;
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(mistake);
    return acc;
  }, {} as Record<string, MistakeData[]>);

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 mb-4">
            <AlertTriangle className="size-3.5 text-red-600 dark:text-red-500" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
              Review Needed
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Mistake Book
          </h1>
          <p className="text-gray-500 text-lg">
            Detailed breakdown of questions you&apos;ve missed.
          </p>
        </div>

        {mistakes.length > 0 && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
              className="rounded-xl border-gray-200 dark:border-gray-700"
            >
              <Download className="size-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handlePracticeAll}
              size="lg"
              className="rounded-xl shadow-lg shadow-blue-500/20 text-white bg-blue-600 hover:bg-blue-700"
            >
              <Play className="size-4 mr-2" />
              Practice Mistakes
            </Button>
          </div>
        )}
      </div>

      {/* Stats Summary - ONLY IF MISTAKES EXIST */}
      {mistakes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {/* Card 1: Total Active */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
               <Zap className="size-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Mistakes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMistakes}</p>
            </div>
          </div>

          {/* Card 2: Weakest Topic */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
               <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Primary Weakness</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1" title={stats.topTopic?.name || "N/A"}>
                {stats.topTopic ? stats.topTopic.name : "N/A"}
              </p>
              {stats.topTopic && (
                 <p className="text-xs text-red-500 font-medium">{stats.topTopic.count} mistakes</p>
              )}
            </div>
          </div>

           {/* Card 3: Common Tags */}
           <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
               <Hash className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium mb-1">Recurring Themes</p>
              {stats.topTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {stats.topTags.map(t => (
                    <span key={t.tag} className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                      #{t.tag} ({t.count})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No tags found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {mistakes.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 flex items-center gap-4">
          <Search className="size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search mistakes..."
            className="bg-transparent flex-1 border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="text-sm text-gray-400 font-medium">
            {filteredMistakes.length} found
          </div>
        </div>
      )}

      {/* Content */}
      {mistakes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <div className="size-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="size-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Clean Sheet!
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You don&apos;t have any pending mistakes to review. Keep up the great
            work!
          </p>
          <Button variant="outline" onClick={() => router.push("/library")}>
            Start New Practice
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedBySubject).map(([subjectName, items]) => (
            <div key={subjectName}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-500 rounded-full" />
                {subjectName}
                <span className="text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </h3>

              <div className="grid gap-6">
                {items.map((mistake) => (
                  <div
                    key={mistake.id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/40 transition-all flex flex-col md:flex-row gap-6 relative group"
                  >
                    <button
                      onClick={() => handleRemoveMistake(mistake.id)}
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
                        <span className="text-xs text-gray-400 font-medium">
                          {mistake.questions.type.replace("_", " ")}
                        </span>
                         {mistake.questions.topics && (
                           <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded flex items-center gap-1">
                             <BookOpen className="size-3" />
                             {mistake.questions.topics.name}
                           </span>
                         )}
                         {mistake.questions.tags && mistake.questions.tags.map(tag => (
                           <span key={tag} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded flex items-center gap-1">
                             <Hash className="size-3" />
                             {tag}
                           </span>
                         ))}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                          {mistake.questions.title}
                        </h4>
                        <div className="text-sm text-gray-500 leading-relaxed mb-4">
                          {mistake.questions.content}
                        </div>
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
                ))}
              </div>
            </div>
          ))}
        </div>
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
