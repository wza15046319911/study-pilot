"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LatexContent } from "@/components/ui/LatexContent";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { X, Tag, Copy, AlertTriangle, Library, GraduationCap, BookOpen, Calendar } from "lucide-react";
import { type QuestionUsage } from "./actions";

interface Question {
  id: number;
  subject_id: number;
  title: string;
  content: string;
  type: string;
  difficulty: string;
  options: { label: string; content: string }[] | null;
  answer: string;
  explanation: string | null;
  code_snippet: string | null;
  topic_id: number | null;
  tags: string[] | null;
  test_cases: {
    function_name: string;
    test_cases: { input: any[]; expected: any }[];
  } | null;
  created_at: string;
  subjects?: { name: string };
}

interface QuestionPreviewModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
  usage?: QuestionUsage;
}

export default function QuestionPreviewModal({
  isOpen,
  question,
  onClose,
  usage,
}: QuestionPreviewModalProps) {
  if (!isOpen || !question) return null;

  const isChoiceType =
    question.type === "single_choice" || question.type === "multiple_choice";

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-x-20 lg:inset-y-16 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-w-5xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-gray-500">
                  #{question.id}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(
                    question.difficulty,
                  )}`}
                >
                  {question.difficulty.toUpperCase()}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                  {question.type.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Subject:
                    </span>
                    {question.subjects?.name || "Unknown"}
                  </div>
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="size-3" />
                      <div className="flex gap-1">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded textxs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Usage / References */}
                {usage && (
                  <div className="pb-6 border-b border-gray-100 dark:border-gray-800 space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Usage & References
                    </h3>

                    {usage.isOrphan ? (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">
                            Orphan Question
                          </p>
                          <p className="text-xs opacity-90">
                            This question is not used in any Question Bank, Mock Exam, Homework, or Weekly Practice.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-2 text-sm">
                        {usage.questionBanks.length > 0 && (
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 w-32 shrink-0 text-blue-600 dark:text-blue-400">
                              <Library className="size-4" />
                              <span className="font-medium">Question Banks</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {usage.questionBanks.map((bank) => (
                                <span
                                  key={bank.id}
                                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs border border-blue-100 dark:border-blue-800"
                                >
                                  {bank.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {usage.exams.length > 0 && (
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 w-32 shrink-0 text-purple-600 dark:text-purple-400">
                              <GraduationCap className="size-4" />
                              <span className="font-medium">Mock Exams</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {usage.exams.map((exam) => (
                                <span
                                  key={exam.id}
                                  className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs border border-purple-100 dark:border-purple-800"
                                >
                                  {exam.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {usage.homeworks.length > 0 && (
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 w-32 shrink-0 text-green-600 dark:text-green-400">
                              <BookOpen className="size-4" />
                              <span className="font-medium">Homework</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {usage.homeworks.map((hw) => (
                                <span
                                  key={hw.id}
                                  className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs border border-green-100 dark:border-green-800"
                                >
                                  {hw.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {usage.weeklyPractices.length > 0 && (
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 w-32 shrink-0 text-orange-600 dark:text-orange-400">
                              <Calendar className="size-4" />
                              <span className="font-medium">Weekly Practice</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {usage.weeklyPractices.map((wp) => (
                                <span
                                  key={wp.id}
                                  className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded text-xs border border-orange-100 dark:border-orange-800"
                                >
                                  {wp.title}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {question.title}
                  </h2>
                </div>

                {/* Code Snippet */}
                {question.code_snippet && (
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider select-none">
                      Code Context
                    </div>
                    <CodeBlock code={question.code_snippet} language="python" />
                  </div>
                )}

                {/* Question Content */}
                <div className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                  <LatexContent className="whitespace-pre-wrap">
                    {question.content}
                  </LatexContent>
                </div>

                {/* Options */}
                {isChoiceType && question.options && (
                  <div className="grid gap-3">
                    {question.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-[background-color,border-color,box-shadow] ${
                          opt.label === question.answer
                            ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm"
                            : "bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700"
                        }`}
                      >
                        <span
                          className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            opt.label === question.answer
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {opt.label}
                        </span>
                        <div className="pt-1">
                          <LatexContent className="whitespace-pre-wrap">
                            {opt.content}
                          </LatexContent>
                        </div>
                        {opt.label === question.answer && (
                          <div className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                            Correct Answer
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Non-choice answer display */}
                {!isChoiceType && question.type !== "coding_challenge" && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-xl">
                    <div className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 uppercase tracking-wider">
                      Correct Answer
                    </div>
                    <div className="font-mono text-lg text-gray-900 dark:text-white">
                      {question.answer}
                    </div>
                  </div>
                )}

                {/* Coding Challenge Test Cases */}
                {question.type === "coding_challenge" &&
                  question.test_cases && (
                    <div className="p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800 rounded-xl">
                      <div className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-3 uppercase tracking-wider">
                        Test Cases · Function:{" "}
                        <code className="bg-violet-100 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">
                          {question.test_cases.function_name}()
                        </code>
                      </div>
                      <div className="space-y-2">
                        {question.test_cases.test_cases.map((tc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 text-sm font-mono bg-white dark:bg-slate-800 p-3 rounded-lg border border-violet-100 dark:border-violet-800"
                          >
                            <span className="text-violet-500 font-bold">
                              #{idx + 1}
                            </span>
                            <span className="text-gray-500">Input:</span>
                            <span className="text-gray-900 dark:text-white">
                              {JSON.stringify(tc.input)}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-gray-500">Expected:</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {JSON.stringify(tc.expected)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl">
                    <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500 mb-3 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Explanation
                    </h3>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      <LatexContent className="whitespace-pre-wrap">
                        {question.explanation}
                      </LatexContent>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
