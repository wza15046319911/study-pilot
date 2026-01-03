"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import { Question, Topic } from "@/types/database";
import { createExam, updateExam } from "./actions";
import {
  ChevronLeft,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Send,
  Search,
  Filter,
} from "lucide-react";
import { LatexContent } from "@/components/ui/LatexContent";
import { CodeBlock } from "@/components/ui/CodeBlock";
import QuestionPreviewModal from "@/app/admin/questions/QuestionPreviewModal";

interface Subject {
  id: number;
  name: string;
}

interface ExamBuilderProps {
  subjects: Subject[];
  initialData?: any; // Consider typing this properly if possible, but any is acceptable for now given the complexity
}

const questionTypes = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "fill_blank", label: "Fill in Blank" },
  { value: "code_output", label: "Code Output" },
];

export default function ExamBuilder({
  subjects,
  initialData,
}: ExamBuilderProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  // Initialize with initialData if available
  const [subjectId, setSubjectId] = useState<string>(
    initialData?.subject_id?.toString() || ""
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [examType, setExamType] = useState<"midterm" | "final">(
    initialData?.exam_type || "midterm"
  );

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(generateSlug(val));
  };
  const [durationHours, setDurationHours] = useState(
    initialData ? Math.floor(initialData.duration_minutes / 60) : 2
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData ? initialData.duration_minutes % 60 : 0
  );
  const [rules, setRules] = useState<Record<string, number>>(
    initialData?.rules || {
      single_choice: 30,
      fill_blank: 5,
    }
  );

  // Data state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(
    initialData?.questions || []
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [bankTopicFilter, setBankTopicFilter] = useState("all");

  // Preview Modal
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // Generation Rules
  const [generationTopicId, setGenerationTopicId] = useState<string>("all");

  const filteredQuestions = availableQuestions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || q.type === typeFilter;
    const matchesTopic =
      bankTopicFilter === "all" || q.topic_id?.toString() === bankTopicFilter;
    return matchesSearch && matchesType && matchesTopic;
  });

  // Fetch questions when subject changes
  useEffect(() => {
    if (!subjectId) {
      setAvailableQuestions([]);
      return;
    }

    const fetchQuestionsAndTopics = async () => {
      setLoading(true);

      // Fetch questions
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("subject_id", parseInt(subjectId))
        .order("type");
      setAvailableQuestions((questionsData as Question[]) || []);

      // Fetch topics
      const { data: topicsData } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", parseInt(subjectId))
        .order("name");
      setTopics((topicsData as Topic[]) || []);

      setLoading(false);
    };

    fetchQuestionsAndTopics();
  }, [subjectId]);

  // Update rule count
  const updateRule = (type: string, count: number) => {
    setRules((prev) => ({ ...prev, [type]: Math.max(0, count) }));
  };

  // Add question to selection
  const addQuestion = (question: Question) => {
    if (selectedQuestions.find((q) => q.id === question.id)) return;
    setSelectedQuestions((prev) => [...prev, question]);
  };

  // Remove question from selection
  const removeQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  // Random generate based on rules
  // Random generate based on rules
  const randomGenerate = () => {
    const newSelection: Question[] = [];

    // Filter available questions by generation topic if set
    const pool =
      generationTopicId === "all"
        ? availableQuestions
        : availableQuestions.filter(
            (q) => q.topic_id?.toString() === generationTopicId
          );

    for (const [type, count] of Object.entries(rules)) {
      const questionsOfType = pool.filter((q) => q.type === type);
      const shuffled = [...questionsOfType].sort(() => 0.5 - Math.random());
      newSelection.push(...shuffled.slice(0, count));
    }

    setSelectedQuestions(newSelection);
  };

  // Save exam
  const saveExam = async (publish: boolean) => {
    if (!subjectId || !title.trim() || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select questions.");
      return;
    }

    setSaving(true);

    const durationTotal = durationHours * 60 + durationMinutes;

    try {
      const payload = {
        subjectId: parseInt(subjectId),
        title: title.trim(),
        slug: slug || generateSlug(title),
        examType,
        durationMinutes: durationTotal,
        rules,
        publish,
        questionIds: selectedQuestions.map((q) => q.id),
      };

      if (initialData) {
        await updateExam({
          ...payload,
          examId: initialData.id,
        });
      } else {
        await createExam(payload);
      }
    } catch (error) {
      alert(
        `Failed to ${initialData ? "update" : "create"} exam: ` +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setSaving(false);
      return;
    }

    router.push("/admin/exams");
  };

  // Count questions by type in selection
  const countByType = selectedQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/exams"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Exam" : "Create Exam"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Configure and build your exam
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {/* Basic Info */}
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Subject *
                </label>
                <Select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    if (!initialData) setSelectedQuestions([]); // Only clear if creating new
                  }}
                  options={subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  placeholder="Select Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c669a] mb-2">
                  Exam Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., 2024 Midterm Exam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c669a] mb-2">
                  Slug (URL)
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. 2024-midterm-exam"
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4c669a] mb-2">
                    Exam Type
                  </label>
                  <Select
                    value={examType}
                    onChange={(e) =>
                      setExamType(e.target.value as "midterm" | "final")
                    }
                    options={[
                      { value: "midterm", label: "Midterm" },
                      { value: "final", label: "Final" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4c669a] mb-2">
                    Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={durationHours}
                      onChange={(e) =>
                        setDurationHours(parseInt(e.target.value) || 0)
                      }
                      min={0}
                      max={5}
                      className="w-16 text-center"
                    />
                    <span className="text-[#4c669a]">h</span>
                    <Input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) =>
                        setDurationMinutes(parseInt(e.target.value) || 0)
                      }
                      min={0}
                      max={59}
                      className="w-16 text-center"
                    />
                    <span className="text-slate-500 dark:text-slate-400">
                      m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Question Rules */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Question Rules</h2>
              <div className="w-[200px]">
                <Select
                  value={generationTopicId}
                  onChange={(e) => setGenerationTopicId(e.target.value)}
                  options={[
                    { value: "all", label: "Any Topic" },
                    ...topics.map((t) => ({
                      value: t.id.toString(),
                      label: t.name,
                    })),
                  ]}
                  placeholder="Source Topic"
                />
              </div>
            </div>
            <div className="space-y-3">
              {questionTypes.map((type) => (
                <div
                  key={type.value}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{type.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateRule(type.value, (rules[type.value] || 0) - 1)
                      }
                      className="size-8 rounded bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors text-gray-600 dark:text-gray-300"
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      value={rules[type.value] || 0}
                      onChange={(e) =>
                        updateRule(type.value, parseInt(e.target.value) || 0)
                      }
                      className="w-16 text-center h-8 p-1 font-mono text-sm"
                      min={0}
                    />
                    <button
                      onClick={() =>
                        updateRule(type.value, (rules[type.value] || 0) + 1)
                      }
                      className="size-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total: {Object.values(rules).reduce((a, b) => a + b, 0)}{" "}
                questions
              </span>
              <Button
                variant="secondary"
                onClick={randomGenerate}
                disabled={!subjectId || loading}
              >
                <Sparkles className="size-4 mr-2" />
                Random Generate
              </Button>
            </div>
          </GlassPanel>

          {/* Available Questions */}
          <GlassPanel className="p-6 max-h-[600px] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold">
                Available Questions
                {subjectId && (
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                    ({filteredQuestions.length}/{availableQuestions.length})
                  </span>
                )}
              </h2>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <Select
                  value={bankTopicFilter}
                  onChange={(e) => setBankTopicFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Topics" },
                    ...topics.map((t) => ({
                      value: t.id.toString(),
                      label: t.name,
                    })),
                  ]}
                />
              </div>
              <div className="w-full sm:w-[200px]">
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Types" },
                    ...questionTypes,
                  ]}
                />
              </div>
            </div>

            {!subjectId ? (
              <p className="text-gray-400 italic text-center py-8">
                Select a subject first
              </p>
            ) : loading ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : filteredQuestions.length === 0 ? (
              <p className="text-gray-400 italic text-center py-8">
                No questions match your search
              </p>
            ) : (
              <div className="space-y-2">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedQuestions.find((sq) => sq.id === q.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : "bg-white/50 dark:bg-slate-800/50 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setPreviewQuestion(q)}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <p className="text-xs text-[#4c669a]">{q.type}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addQuestion(q);
                      }}
                      disabled={
                        !!selectedQuestions.find((sq) => sq.id === q.id)
                      }
                      className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <GlassPanel className="p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Exam Preview</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {selectedQuestions.length} questions selected
              </span>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800/80 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Duration:
                  </span>
                  <span className="ml-2 font-medium">
                    {durationHours}h {durationMinutes}m
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Type:
                  </span>
                  <span className="ml-2 font-medium capitalize">
                    {examType}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(countByType).map(([type, count]) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-xs font-medium"
                  >
                    {type.replace("_", " ")}: {count}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected Questions */}

            <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
              {selectedQuestions.length === 0 ? (
                <p className="text-gray-400 italic text-center py-8">
                  No questions selected yet
                </p>
              ) : (
                selectedQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative group"
                  >
                    <div className="flex gap-4">
                      <span className="text-lg font-bold text-slate-500 dark:text-slate-400">
                        {index + 1}.
                      </span>
                      <div className="flex-1 space-y-3 min-w-0">
                        {/* Question Title/Content */}
                        <div className="prose dark:prose-invert max-w-none">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            <LatexContent>{q.content}</LatexContent>
                          </div>
                        </div>

                        {/* Code Snippet */}
                        {q.code_snippet && (
                          <div className="mt-2 text-sm">
                            <CodeBlock
                              code={q.code_snippet}
                              language="python"
                            />
                          </div>
                        )}

                        {/* Options */}
                        {(q.type === "single_choice" ||
                          q.type === "multiple_choice") &&
                          q.options && (
                            <div className="space-y-2 mt-3">
                              {(q.options as any[]).map(
                                (opt: any, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-3 text-sm"
                                  >
                                    <div className="flex items-center justify-center size-6 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-xs font-medium shrink-0 mt-0.5">
                                      {String.fromCharCode(65 + i)}
                                    </div>
                                    <div className="text-slate-700 dark:text-slate-300 pt-0.5">
                                      <LatexContent>
                                        {opt.content || opt.label}
                                      </LatexContent>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        {/* Type Badge */}
                        <div className="pt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 capitalize">
                            {q.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Delete Action */}
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove question"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => saveExam(false)}
                disabled={saving || selectedQuestions.length === 0}
                className="flex-1"
              >
                <Save className="size-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => saveExam(true)}
                disabled={saving || selectedQuestions.length === 0}
                className="flex-1"
              >
                <Send className="size-4 mr-2" />
                Publish
              </Button>
            </div>
          </GlassPanel>
        </div>
      </div>
      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        question={previewQuestion as any}
        onClose={() => setPreviewQuestion(null)}
      />
    </main>
  );
}
