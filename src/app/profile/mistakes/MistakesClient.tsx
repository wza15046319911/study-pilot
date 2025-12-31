"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { ExportMistakesModal } from "@/components/modals/ExportMistakesModal";
import { encodeId } from "@/lib/ids";
import {
  AlertTriangle,
  Trash2,
  Play,
  BookOpen,
  CheckCircle2,
  XCircle,
  Download,
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
    options?: any;
    subject_id: number;
    subjects: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

interface MistakesClientProps {
  mistakes: MistakeData[];
  userId: string;
}

export default function MistakesClient({
  mistakes: initialMistakes,
  userId,
}: MistakesClientProps) {
  const router = useRouter();
  const [mistakes, setMistakes] = useState(initialMistakes);
  const [showExportModal, setShowExportModal] = useState(false);
  const supabase = createClient();

  const handleRemoveMistake = async (mistakeId: number) => {
    setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
    await supabase.from("mistakes").delete().eq("id", mistakeId);
  };

  const handlePracticeAll = () => {
    if (mistakes.length === 0) return;

    // Get unique subject IDs
    const subjectIds = [
      ...new Set(mistakes.map((m) => m.questions.subject_id)),
    ];
    const firstSubjectId = subjectIds[0];
    const questionIds = mistakes
      .filter((m) => m.questions.subject_id === firstSubjectId)
      .map((m) => encodeId(m.question_id))
      .join(",");

    // Use the first subject's slug for the URL
    // We assume all selected mistakes belong to the same subject as per filtering logic below
    const firstMistake = mistakes.find(
      (m) => m.questions.subject_id === firstSubjectId
    );

    if (firstMistake) {
      router.push(
        `/practice/${firstMistake.questions.subjects.slug}?mode=mistakes&questions=${questionIds}`
      );
    }
  };

  const groupedBySubject = mistakes.reduce((acc, mistake) => {
    const subjectName = mistake.questions.subjects.name;
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(mistake);
    return acc;
  }, {} as Record<string, MistakeData[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="size-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
                Mistakes Book
              </h1>
              <p className="text-[#4c669a]">
                {mistakes.length} question{mistakes.length !== 1 && "s"} to
                review
              </p>
            </div>
          </div>

          {mistakes.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowExportModal(true)}
              >
                <Download className="size-4 mr-2" />
                Export
              </Button>
              <Button onClick={handlePracticeAll} size="lg">
                <Play className="size-4 mr-2" />
                Practice Mistakes
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {mistakes.length === 0 ? (
          <GlassPanel className="p-12 text-center">
            <BookOpen className="size-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              No mistakes found
            </h2>
            <p className="text-gray-400 mb-6">
              Great job! Keep practicing to maintain your streak.
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
                  {items.map((mistake) => (
                    <GlassPanel
                      key={mistake.id}
                      className="p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-mono">
                              {mistake.error_count} Errors
                            </span>
                            <span className="text-xs text-gray-400">
                              {mistake.questions.type}
                            </span>
                          </div>
                          <h3 className="font-medium text-[#0d121b] dark:text-white mb-1">
                            {mistake.questions.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleRemoveMistake(mistake.id)}
                          className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove from mistakes"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-red-500 uppercase flex items-center gap-1">
                            <XCircle className="size-3" />
                            Your Answer
                          </span>
                          <p className="font-mono text-[#0d121b] dark:text-gray-300 break-all">
                            {mistake.last_wrong_answer || "(Unknown)"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-green-500 uppercase flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            Correct Answer
                          </span>
                          <p className="font-mono text-[#0d121b] dark:text-gray-300 break-all">
                            {mistake.questions.answer}
                          </p>
                        </div>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ExportMistakesModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        mistakes={mistakes as any}
        userId={userId}
      />
    </div>
  );
}
