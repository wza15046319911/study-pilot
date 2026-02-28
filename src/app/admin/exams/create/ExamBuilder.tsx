"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createExam, updateExam } from "./actions";
import { QuestionPickerPanel } from "@/components/admin/question-picker/QuestionPickerPanel";
import type { QuestionPoolListItem } from "@/lib/actions/questionPool";
import {
  ChevronLeft,
  Save,
  Send,
  ListChecks,
  Brain,
  Timer,
  Eye,
  EyeOff,
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface ExamBuilderProps {
  subjects: Subject[];
  initialData?: {
    id?: number;
    subject_id?: number;
    title?: string;
    slug?: string;
    exam_type?: "midterm" | "final";
    unlock_type?: "free" | "premium" | "referral" | "paid";
    price?: number;
    allowed_modes?: string[];
    visibility?: "public" | "assigned_only";
    duration_minutes?: number;
    rules?: Record<string, number>;
    questions?: QuestionPoolListItem[];
  };
}

export default function ExamBuilder({
  subjects,
  initialData,
}: ExamBuilderProps) {
  const router = useRouter();

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
  const [unlockType, setUnlockType] = useState<
    "free" | "premium" | "referral" | "paid"
  >(initialData?.unlock_type || "free");
  const [price, setPrice] = useState<number | undefined>(
    initialData?.price || undefined
  );
  const [allowedModes, setAllowedModes] = useState<string[]>(
    initialData?.allowed_modes || ["exam"]
  );
  const [visibility, setVisibility] = useState<"public" | "assigned_only">(
    initialData?.visibility || "public"
  );

  // Toggle helper for practice modes
  const toggleMode = (mode: string) => {
    setAllowedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

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
  const initialDurationMinutes = initialData?.duration_minutes ?? 120;
  const [durationHours, setDurationHours] = useState(
    Math.floor(initialDurationMinutes / 60),
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialDurationMinutes % 60,
  );
  const [rules, setRules] = useState<Record<string, number>>(
    initialData?.rules || {
      single_choice: 30,
      fill_blank: 5,
    },
  );

  const [selectedQuestions, setSelectedQuestions] = useState<
    QuestionPoolListItem[]
  >(initialData?.questions || []);
  const [saving, setSaving] = useState(false);

  // Generation Rules
  const [generationTopicId, setGenerationTopicId] = useState<string>("all");
  const selectedSubjectId = subjectId ? Number.parseInt(subjectId, 10) : null;

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
        unlockType,
        price: unlockType === "paid" ? price : null,
        allowedModes,
        visibility,
      };

      if (initialData?.id != null) {
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4c669a] mb-2">
                    Unlock Type
                  </label>
                  <Select
                    value={unlockType}
                    onChange={(e) =>
                      setUnlockType(
                        e.target.value as
                          | "free"
                          | "premium"
                          | "referral"
                          | "paid",
                      )
                    }
                    options={[
                      { value: "free", label: "Free" },
                      { value: "premium", label: "Premium (VIP Only)" },
                      { value: "referral", label: "Referral Reward" },
                      { value: "paid", label: "Paid" },
                    ]}
                  />
                </div>
                {unlockType === "paid" && (
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] mb-2">
                      Price ($)
                    </label>
                    <Input
                      type="number"
                      value={price || ""}
                      onChange={(e) =>
                        setPrice(parseFloat(e.target.value) || 0)
                      }
                      placeholder="9.99"
                      min={0}
                      step={0.01}
                    />
                  </div>
                )}
              </div>

              {/* Practice Modes */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Allowed Practice Modes *
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      allowedModes.includes("exam")
                        ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModes.includes("exam")}
                      onChange={() => toggleMode("exam")}
                      className="size-4 text-indigo-600 focus:ring-indigo-500 rounded"
                    />
                    <Timer className="size-5 text-indigo-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Exam Mode
                      </span>
                      <span className="text-xs text-slate-400">
                        Timed, no hints, strict conditions
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      allowedModes.includes("standard")
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModes.includes("standard")}
                      onChange={() => toggleMode("standard")}
                      className="size-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <ListChecks className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Standard Practice
                      </span>
                      <span className="text-xs text-slate-400">
                        Untimed, instant feedback
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      allowedModes.includes("immersive")
                        ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModes.includes("immersive")}
                      onChange={() => toggleMode("immersive")}
                      className="size-4 text-violet-600 focus:ring-violet-500 rounded"
                    />
                    <Brain className="size-5 text-violet-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Immersive
                      </span>
                      <span className="text-xs text-slate-400">
                        Focus mode, distraction free
                      </span>
                    </div>
                  </label>
                </div>
                {allowedModes.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    At least one mode is required
                  </p>
                )}
              </div>

              {/* Visibility */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      visibility === "public"
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                      className="size-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Eye className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">Public</span>
                      <span className="text-xs text-slate-400">
                        Visible in library
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      visibility === "assigned_only"
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "assigned_only"}
                      onChange={() => setVisibility("assigned_only")}
                      className="size-4 text-blue-600 focus:ring-blue-500"
                    />
                    <EyeOff className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Assigned Only
                      </span>
                      <span className="text-xs text-slate-400">
                        Only for specific users
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </GlassPanel>

        </div>

        {/* Right Panel - Questions */}
        <div className="space-y-6">
          <GlassPanel className="p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Questions</h2>
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
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Unlock:
                  </span>
                  <span className="ml-2 font-medium capitalize">
                    {unlockType}
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
            <QuestionPickerPanel
              subjectId={selectedSubjectId}
              selectedQuestions={selectedQuestions}
              onSelectedQuestionsChange={setSelectedQuestions}
              randomizer={{
                enabled: true,
                rules,
                onRulesChange: setRules,
                generationTopicId,
                onGenerationTopicIdChange: setGenerationTopicId,
              }}
            />

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
    </main>
  );
}
