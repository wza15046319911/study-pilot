"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LatexContent } from "@/components/ui/LatexContent";
import type { Question, Topic } from "@/types/database";
import {
  getQuestionPoolBySubject,
  getQuestionPreviewById,
  type QuestionPoolListItem,
} from "@/lib/actions/questionPool";
import {
  applyRandomRules,
  dedupeQuestionsById,
  filterQuestionPool,
} from "./questionPicker.utils";

const QuestionPreviewModal = dynamic(
  () => import("@/app/admin/questions/QuestionPreviewModal"),
  { ssr: false },
);

type QuestionType = Question["type"];
type RawPreviewQuestion = Question & { subjects?: { name: string } | null };
type ModalPreviewQuestion = {
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
    test_cases: { input: unknown[]; expected: unknown }[];
  } | null;
  created_at: string;
  subjects?: { name: string };
};

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "fill_blank", label: "Fill in Blank" },
  { value: "code_output", label: "Code Output" },
  { value: "handwrite", label: "Handwrite" },
  { value: "true_false", label: "True / False" },
  { value: "coding_challenge", label: "Coding Challenge" },
];

const toOptionArray = (
  value: Question["options"],
): { label: string; content: string }[] | null => {
  if (!Array.isArray(value)) return null;

  const parsed = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const maybeLabel = "label" in item ? item.label : null;
      const maybeContent = "content" in item ? item.content : null;
      if (typeof maybeLabel !== "string" || typeof maybeContent !== "string") {
        return null;
      }
      return { label: maybeLabel, content: maybeContent };
    })
    .filter((item): item is { label: string; content: string } => Boolean(item));

  return parsed.length > 0 ? parsed : null;
};

const toTestCases = (value: Question["test_cases"]) => {
  if (!value || typeof value !== "object") return null;
  if (!("function_name" in value) || !("test_cases" in value)) return null;
  if (typeof value.function_name !== "string") return null;
  if (!Array.isArray(value.test_cases)) return null;

  const parsedCases = value.test_cases
    .map((testCase) => {
      if (!testCase || typeof testCase !== "object") return null;
      if (!("input" in testCase) || !("expected" in testCase)) return null;
      if (!Array.isArray(testCase.input)) return null;
      return {
        input: testCase.input as unknown[],
        expected: testCase.expected as unknown,
      };
    })
    .filter(
      (testCase): testCase is { input: unknown[]; expected: unknown } =>
        Boolean(testCase),
    );

  return {
    function_name: value.function_name,
    test_cases: parsedCases,
  };
};

const toModalPreviewQuestion = (
  question: RawPreviewQuestion,
): ModalPreviewQuestion => ({
  id: question.id,
  subject_id: question.subject_id,
  title: question.title,
  content: question.content,
  type: question.type,
  difficulty: question.difficulty,
  options: toOptionArray(question.options),
  answer: question.answer,
  explanation: question.explanation,
  code_snippet: question.code_snippet,
  topic_id: question.topic_id,
  tags: question.tags,
  test_cases: toTestCases(question.test_cases),
  created_at: question.created_at,
  subjects: question.subjects ?? undefined,
});

export interface QuestionPickerRandomizerProps {
  enabled: boolean;
  rules: Partial<Record<QuestionType, number>>;
  onRulesChange: (next: Partial<Record<QuestionType, number>>) => void;
  generationTopicId: string;
  onGenerationTopicIdChange: (next: string) => void;
}

export interface QuestionPickerPanelProps {
  subjectId: number | null;
  selectedQuestions: QuestionPoolListItem[];
  onSelectedQuestionsChange: (next: QuestionPoolListItem[]) => void;
  enableSearch?: boolean;
  enableTypeFilter?: boolean;
  enableTopicFilter?: boolean;
  enablePreview?: boolean;
  labels?: {
    availableTitle?: string;
    selectedTitle?: string;
    emptyAvailable?: string;
    emptySelected?: string;
  };
  randomizer?: QuestionPickerRandomizerProps;
}

export function QuestionPickerPanel({
  subjectId,
  selectedQuestions,
  onSelectedQuestionsChange,
  enableSearch = true,
  enableTypeFilter = true,
  enableTopicFilter = true,
  enablePreview = true,
  labels,
  randomizer,
}: QuestionPickerPanelProps) {
  const [availableQuestions, setAvailableQuestions] = useState<
    QuestionPoolListItem[]
  >([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const [previewQuestion, setPreviewQuestion] = useState<
    ModalPreviewQuestion | null
  >(
    null,
  );
  const [previewLoading, setPreviewLoading] = useState(false);

  const activeRequestRef = useRef(0);
  const previewCacheRef = useRef<Map<number, ModalPreviewQuestion>>(new Map());

  useEffect(() => {
    if (!subjectId) {
      setAvailableQuestions([]);
      setTopics([]);
      setLoading(false);
      setLoadingError(null);
      setSearchQuery("");
      setTypeFilter("all");
      setTopicFilter("all");
      return;
    }

    const requestId = ++activeRequestRef.current;

    const fetchPool = async () => {
      setLoading(true);
      setLoadingError(null);
      try {
        const { questions, topics: fetchedTopics } = await getQuestionPoolBySubject({
          subjectId,
          limit: 500,
        });

        if (requestId !== activeRequestRef.current) {
          return;
        }

        setAvailableQuestions(questions || []);
        setTopics(fetchedTopics || []);
      } catch (error) {
        console.error("Failed to fetch question pool:", error);
        if (requestId === activeRequestRef.current) {
          setLoadingError(
            "Failed to load questions. Please refresh or try another subject.",
          );
          setAvailableQuestions([]);
          setTopics([]);
        }
      } finally {
        if (requestId === activeRequestRef.current) {
          setLoading(false);
        }
      }
    };

    void fetchPool();
  }, [subjectId]);

  const filteredQuestions = useMemo(
    () =>
      filterQuestionPool(availableQuestions, {
        searchQuery,
        typeFilter,
        topicFilter,
      }),
    [availableQuestions, searchQuery, typeFilter, topicFilter],
  );

  const addQuestion = (question: QuestionPoolListItem) => {
    onSelectedQuestionsChange(
      dedupeQuestionsById([...selectedQuestions, question]),
    );
  };

  const removeQuestion = (questionId: number) => {
    onSelectedQuestionsChange(
      selectedQuestions.filter((question) => question.id !== questionId),
    );
  };

  const openPreview = async (question: QuestionPoolListItem) => {
    if (!enablePreview) return;

    const cached = previewCacheRef.current.get(question.id);
    if (cached) {
      setPreviewQuestion(cached);
      return;
    }

    setPreviewLoading(true);
    try {
      const full = await getQuestionPreviewById({ questionId: question.id });
      if (!full) {
        setPreviewQuestion(null);
        return;
      }
      const nextQuestion = toModalPreviewQuestion(full as RawPreviewQuestion);
      previewCacheRef.current.set(question.id, nextQuestion);
      setPreviewQuestion(nextQuestion);
    } catch (error) {
      console.error("Failed to load preview question:", error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const showFilters = enableSearch || enableTypeFilter || enableTopicFilter;
  const selectedIdSet = useMemo(
    () => new Set(selectedQuestions.map((question) => question.id)),
    [selectedQuestions],
  );

  const applyRandomSelection = () => {
    if (!randomizer?.enabled) return;
    onSelectedQuestionsChange(
      applyRandomRules({
        pool: availableQuestions,
        rules: randomizer.rules,
        generationTopicId: randomizer.generationTopicId,
      }),
    );
  };

  const updateRuleValue = (type: QuestionType, nextValue: number) => {
    if (!randomizer?.enabled) return;
    randomizer.onRulesChange({
      ...randomizer.rules,
      [type]: Math.max(0, Number(nextValue) || 0),
    });
  };

  return (
    <div className="space-y-4">
      {randomizer?.enabled ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Random Generator
            </h3>
            <Button
              variant="secondary"
              onClick={applyRandomSelection}
              disabled={!subjectId || loading}
            >
              <Sparkles className="size-4 mr-2" />
              Random Generate
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={randomizer.generationTopicId}
              onChange={(event) =>
                randomizer.onGenerationTopicIdChange(event.target.value)
              }
              options={[
                { value: "all", label: "Any Topic" },
                ...topics.map((topic) => ({
                  value: topic.id.toString(),
                  label: topic.name,
                })),
              ]}
              placeholder="Source topic"
            />
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
              Type-specific counts will be capped when available questions are
              insufficient.
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <span className="w-36 text-xs text-slate-600 dark:text-slate-300">
                  {option.label}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    updateRuleValue(
                      option.value,
                      (randomizer.rules[option.value] || 0) - 1,
                    )
                  }
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={0}
                  value={randomizer.rules[option.value] || 0}
                  onChange={(event) =>
                    updateRuleValue(
                      option.value,
                      Number.parseInt(event.target.value, 10) || 0,
                    )
                  }
                  className="h-9 w-16 text-center"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    updateRuleValue(
                      option.value,
                      (randomizer.rules[option.value] || 0) + 1,
                    )
                  }
                >
                  +
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {showFilters ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {enableSearch ? (
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search questions..."
                className="pl-9"
              />
            </div>
          ) : null}
          {enableTypeFilter ? (
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              options={[
                { value: "all", label: "All types" },
                ...QUESTION_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}
              placeholder="All types"
            />
          ) : null}
          {enableTopicFilter ? (
            <Select
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              options={[
                { value: "all", label: "All topics" },
                ...topics.map((topic) => ({
                  value: topic.id,
                  label: topic.name,
                })),
              ]}
              placeholder="All topics"
            />
          ) : null}
        </div>
      ) : null}

      {loadingError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {loadingError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 h-[calc(100vh-350px)] overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {labels?.availableTitle || "Available Questions"}
          </h3>
          {!subjectId ? (
            <p className="text-sm text-slate-500">Select a subject first.</p>
          ) : loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : filteredQuestions.length === 0 ? (
            <p className="text-sm text-slate-500">
              {labels?.emptyAvailable || "No questions found."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="group rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex gap-3 items-start">
                    <button
                      type="button"
                      className="flex-1 text-left min-w-0"
                      onClick={() => void openPreview(question)}
                    >
                      <div className="text-sm text-slate-800 dark:text-slate-100 line-clamp-2">
                        <LatexContent content={question.content} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                          {question.type.replace("_", " ")}
                        </span>
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                          {question.difficulty}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion(question)}
                      disabled={selectedIdSet.has(question.id)}
                      className="shrink-0 p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Add question"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 h-[calc(100vh-350px)] overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {labels?.selectedTitle || "Selected Questions"}
          </h3>
          {selectedQuestions.length === 0 ? (
            <p className="text-sm text-slate-500">
              {labels?.emptySelected || "No questions selected yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {selectedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="group rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/60 dark:bg-slate-900/40"
                >
                  <div className="flex gap-3 items-start">
                    <button
                      type="button"
                      className="flex-1 text-left min-w-0"
                      onClick={() => void openPreview(question)}
                    >
                      <div className="text-xs text-slate-400 mb-1">
                        #{index + 1}
                      </div>
                      <div className="text-sm text-slate-800 dark:text-slate-100 line-clamp-2">
                        <LatexContent content={question.content} />
                      </div>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {question.type.replace("_", " ")}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="shrink-0 p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white"
                      aria-label="Remove question"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewLoading ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <span className="rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm shadow">
            Loading preview...
          </span>
        </div>
      ) : null}

      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        question={previewQuestion}
        onClose={() => setPreviewQuestion(null)}
      />
    </div>
  );
}
