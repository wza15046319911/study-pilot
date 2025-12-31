"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import { Question } from "@/types/database";
import { createExam } from "./actions";
import {
  ChevronLeft,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Send,
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface ExamBuilderProps {
  subjects: Subject[];
}

const questionTypes = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "fill_blank", label: "Fill in Blank" },
  { value: "code_output", label: "Code Output" },
];

export default function ExamBuilder({ subjects }: ExamBuilderProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [subjectId, setSubjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [examType, setExamType] = useState<"midterm" | "final">("midterm");

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
  const [durationHours, setDurationHours] = useState(2);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [rules, setRules] = useState<Record<string, number>>({
    single_choice: 30,
    fill_blank: 5,
  });

  // Question selection
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch questions when subject changes
  useEffect(() => {
    if (!subjectId) {
      setAvailableQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("subject_id", parseInt(subjectId))
        .order("type");
      setAvailableQuestions((data as Question[]) || []);
      setLoading(false);
    };

    fetchQuestions();
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
  const randomGenerate = () => {
    const newSelection: Question[] = [];

    for (const [type, count] of Object.entries(rules)) {
      const questionsOfType = availableQuestions.filter((q) => q.type === type);
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
      await createExam({
        subjectId: parseInt(subjectId),
        title: title.trim(),
        slug: slug || generateSlug(title),
        examType,
        durationMinutes: durationTotal,
        rules,
        publish,
        questionIds: selectedQuestions.map((q) => q.id),
      });
    } catch (error) {
      alert(
        "Failed to create exam: " +
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
          <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
            Create Exam
          </h1>
          <p className="text-[#4c669a]">Configure and build your exam</p>
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
                <label className="block text-sm font-medium text-[#4c669a] mb-2">
                  Subject *
                </label>
                <Select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setSelectedQuestions([]);
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
                    <span className="text-[#4c669a]">m</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Question Rules */}
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold mb-4">Question Rules</h2>
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
                      className="size-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600"
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
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-[#4c669a]">
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
          <GlassPanel className="p-6 max-h-[400px] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              Available Questions
              {subjectId && (
                <span className="text-sm font-normal text-[#4c669a] ml-2">
                  ({availableQuestions.length})
                </span>
              )}
            </h2>
            {!subjectId ? (
              <p className="text-gray-400 italic">Select a subject first</p>
            ) : loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <div className="space-y-2">
                {availableQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedQuestions.find((sq) => sq.id === q.id)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white/50 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <p className="text-xs text-[#4c669a]">{q.type}</p>
                    </div>
                    <button
                      onClick={() => addQuestion(q)}
                      disabled={
                        !!selectedQuestions.find((sq) => sq.id === q.id)
                      }
                      className="p-1.5 rounded bg-[#135bec] text-white hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
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
              <span className="text-sm text-[#4c669a]">
                {selectedQuestions.length} questions selected
              </span>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#4c669a]">Duration:</span>
                  <span className="ml-2 font-medium">
                    {durationHours}h {durationMinutes}m
                  </span>
                </div>
                <div>
                  <span className="text-[#4c669a]">Type:</span>
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
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {selectedQuestions.length === 0 ? (
                <p className="text-gray-400 italic text-center py-8">
                  No questions selected yet
                </p>
              ) : (
                selectedQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800 rounded-lg border border-gray-100"
                  >
                    <span className="text-sm font-bold text-[#4c669a] w-6">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <p className="text-xs text-[#4c669a]">{q.type}</p>
                    </div>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
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
    </main>
  );
}
