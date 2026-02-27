"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createClient } from "@/lib/supabase/client";
import { Question, Topic } from "@/types/database";
import { createQuestionBank, updateQuestionBank } from "./actions";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Search,
  Lock,
  Globe,
  Gift,
  DollarSign,
  ListChecks,
  Brain,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";
import { LatexContent } from "@/components/ui/LatexContent";

// Lazy-load preview modal (avoids pulling in code-editing/CodeBlock until needed)
const QuestionPreviewModal = dynamic(
  () => import("@/app/admin/questions/QuestionPreviewModal"),
  { ssr: false },
);

interface Subject {
  id: number;
  name: string;
}

interface BankBuilderProps {
  subjects: Subject[];
  initialData?: any;
}

export default function BankBuilder({
  subjects,
  initialData,
}: BankBuilderProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [subjectId, setSubjectId] = useState<string>(
    initialData?.subject_id?.toString() || "",
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [unlockType, setUnlockType] = useState<
    "free" | "premium" | "referral" | "paid"
  >(initialData?.unlock_type || "free");
  const [price, setPrice] = useState<string>(
    initialData?.price?.toString() || "",
  );
  const [allowedModes, setAllowedModes] = useState<string[]>(
    initialData?.allowed_modes || ["standard", "immersive", "flashcard"],
  );
  const [visibility, setVisibility] = useState<"public" | "assigned_only">(
    initialData?.visibility || "public",
  );

  // Toggle helper for practice modes
  const toggleMode = (mode: string) => {
    setAllowedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Data State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(
    initialData?.questions || [],
  );

  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const filteredQuestions = availableQuestions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || q.type === typeFilter;
    const matchesTopic =
      topicFilter === "all" || q.topic_id?.toString() === topicFilter;
    return matchesSearch && matchesType && matchesTopic;
  });

  // Fetch questions when subject changes
  useEffect(() => {
    if (!subjectId) {
      setAvailableQuestions([]);
      setTopics([]);
      return;
    }

    const sid = parseInt(subjectId, 10);
    if (Number.isNaN(sid)) {
      setAvailableQuestions([]);
      setTopics([]);
      return;
    }

    const fetchQuestionsAndTopics = async () => {
      setLoading(true);
      setLoadingError(null);
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 12000);

        const [questionsRes, topicsRes] = await Promise.all([
          supabase
            .from("questions")
            .select(
              "id, subject_id, title, content, type, difficulty, topic_id",
            )
            .eq("subject_id", sid)
            .order("type")
            .limit(500)
            .abortSignal(controller.signal),
          supabase
            .from("topics")
            .select("*")
            .eq("subject_id", sid)
            .order("name")
            .abortSignal(controller.signal),
        ]);

        if (questionsRes.error) {
          console.error("Error fetching questions:", questionsRes.error);
          setLoadingError("Failed to load available questions.");
        }
        if (topicsRes.error) {
          console.error("Error fetching topics:", topicsRes.error);
          setLoadingError("Failed to load topics.");
        }

        setAvailableQuestions((questionsRes.data as Question[]) || []);
        setTopics((topicsRes.data as Topic[]) || []);
      } catch (error) {
        console.error("Error in fetchQuestionsAndTopics:", error);
        setLoadingError(
          "Loading questions timed out. Please refresh or narrow to another subject.",
        );
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setLoading(false);
      }
    };

    fetchQuestionsAndTopics();
  }, [subjectId, supabase]);

  const [addingId, setAddingId] = useState<number | null>(null);

  const addQuestion = async (question: Question) => {
    if (selectedQuestions.find((q) => q.id === question.id)) return;
    setAddingId(question.id);
    try {
      const { data: full } = await supabase
        .from("questions")
        .select(
          "id, subject_id, title, content, type, difficulty, options, code_snippet, topic_id",
        )
        .eq("id", question.id)
        .single();
      if (full) {
        setSelectedQuestions((prev) => [...prev, full as Question]);
      }
    } finally {
      setAddingId(null);
    }
  };

  const removeQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const saveBank = async (publish: boolean) => {
    if (!subjectId || !title.trim() || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select questions.");
      return;
    }

    if (allowedModes.length === 0) {
      alert("Please select at least one practice mode.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        subjectId: parseInt(subjectId),
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        unlockType,
        price: unlockType === "paid" ? parseFloat(price) || null : null,
        allowedModes,
        visibility,
        isPublished: publish,
        questionIds: selectedQuestions.map((q) => q.id),
      };

      if (initialData) {
        await updateQuestionBank({
          ...payload,
          bankId: initialData.id,
        });
      } else {
        await createQuestionBank(payload);
      }

      router.push("/admin/question-banks");
    } catch (error) {
      console.error(error);
      alert("Failed to save question bank.");
      setSaving(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/question-banks"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="size-6 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Question Bank" : "Create Question Bank"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Curate questions for focused practice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
        {/* Left Panel - Configuration & Selection */}
        <div className="space-y-6">
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Subject *
                </label>
                <Select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    if (!initialData) setSelectedQuestions([]);
                  }}
                  options={subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  placeholder="Select Subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!initialData) {
                      setSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g. Calculus I - Derivatives Mastery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Slug *
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  placeholder="e.g. calculus-derivatives-mastery"
                />
                <p className="text-xs text-slate-400 mt-1">
                  URL-friendly identifier (auto-generated from title)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this question bank"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Access Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "free"
                        ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "free"}
                      onChange={() => setUnlockType("free")}
                      className="size-4 text-green-600 focus:ring-green-500"
                    />
                    <Globe className="size-5 text-green-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Free Access
                      </span>
                      <span className="text-xs text-slate-400">
                        All users can access
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "premium"
                        ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "premium"}
                      onChange={() => setUnlockType("premium")}
                      className="size-4 text-amber-600 focus:ring-amber-500"
                    />
                    <Lock className="size-5 text-amber-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        VIP Premium
                      </span>
                      <span className="text-xs text-slate-400">
                        VIP members only
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "referral"
                        ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "referral"}
                      onChange={() => setUnlockType("referral")}
                      className="size-4 text-purple-600 focus:ring-purple-500"
                    />
                    <Gift className="size-5 text-purple-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Referral Unlock
                      </span>
                      <span className="text-xs text-slate-400">
                        Users earn access by inviting friends
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "paid"
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "paid"}
                      onChange={() => setUnlockType("paid")}
                      className="size-4 text-blue-600 focus:ring-blue-500"
                    />
                    <DollarSign className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Paid (Purchase Required)
                      </span>
                      <span className="text-xs text-slate-400">
                        Must be purchased, even by VIP users
                      </span>
                    </div>
                  </label>

                  {unlockType === "paid" && (
                    <div className="mt-3 pl-8">
                      <label className="block text-sm font-medium text-slate-500 mb-2">
                        Price (AUD)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 9.99"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Practice Modes */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Allowed Practice Modes *
                </label>
                <div className="space-y-2">
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
                        Standard
                      </span>
                      <span className="text-xs text-slate-400">
                        Practice with custom filters, track progress
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
                        Focused, distraction-free practice
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      allowedModes.includes("flashcard")
                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModes.includes("flashcard")}
                      onChange={() => toggleMode("flashcard")}
                      className="size-4 text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <GraduationCap className="size-5 text-emerald-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Flashcard
                      </span>
                      <span className="text-xs text-slate-400">
                        Spaced repetition review
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

          <GlassPanel className="p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold">Available Questions</h2>
              {subjectId && (
                <span className="text-sm text-slate-500">
                  {filteredQuestions.length} matches
                </span>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Topics" },
                  ...topics.map((t) => ({
                    value: t.id.toString(),
                    label: t.name,
                  })),
                ]}
                className="w-[160px]"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-2">
              {!subjectId ? (
                <p className="text-center py-10 text-gray-400 italic">
                  Select a subject first
                </p>
              ) : loading ? (
                <p className="text-center py-10 text-gray-400">
                  Loading questions...
                </p>
              ) : loadingError ? (
                <p className="text-center py-10 text-red-500">{loadingError}</p>
              ) : filteredQuestions.length === 0 ? (
                <p className="text-center py-10 text-gray-400 italic">
                  No questions found
                </p>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-[background-color,border-color] cursor-pointer ${
                      selectedQuestions.find((sq) => sq.id === q.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : "bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={async () => {
                      setPreviewLoading(true);
                      try {
                        const { data: full } = await supabase
                          .from("questions")
                          .select(
                            "id, subject_id, title, content, type, difficulty, options, answer, explanation, code_snippet, topic_id, tags, test_cases, subjects(name)",
                          )
                          .eq("id", q.id)
                          .single();
                        if (full) setPreviewQuestion(full as Question);
                      } finally {
                        setPreviewLoading(false);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 mb-1">
                        {q.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {q.type.replace("_", " ")}
                        </span>
                        {q.difficulty && (
                          <span
                            className={`capitalize px-1.5 py-0.5 rounded ${
                              q.difficulty === "easy"
                                ? "bg-green-100 text-green-700"
                                : q.difficulty === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addQuestion(q);
                      }}
                      disabled={
                        !!selectedQuestions.find((sq) => sq.id === q.id) ||
                        addingId === q.id
                      }
                      className="shrink-0 p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {addingId === q.id ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Right Panel - Preview & Save */}
        <div className="space-y-6">
          <GlassPanel className="p-6 h-[calc(100vh-140px)] sticky top-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-bold">Selected Questions</h2>
              <span className="text-sm font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {selectedQuestions.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-2">
              {selectedQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <Plus className="size-8 mb-2 opacity-50" />
                  <p>Add questions from the left panel</p>
                </div>
              ) : (
                selectedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="group relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex gap-3">
                      <span className="text-sm font-bold text-slate-400 mt-0.5 w-6">
                        {idx + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="prose dark:prose-invert max-w-none text-sm mb-2">
                          <LatexContent>{q.content}</LatexContent>
                        </div>
                        {q.code_snippet && (
                          <pre className="text-xs mb-2 overflow-x-auto rounded-lg bg-slate-900 text-slate-100 p-2 font-mono">
                            {q.code_snippet.replace(/\\n/g, "\n")}
                          </pre>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {q.options &&
                            (q.type === "single_choice" ||
                              q.type === "multiple_choice") && (
                              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-slate-500">
                                {(q.options as any[]).length} Options
                              </span>
                            )}
                          <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded">
                            {q.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-[color,background-color,opacity]"
                      aria-label="Remove question"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4 shrink-0 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => saveBank(false)}
                disabled={saving || selectedQuestions.length === 0}
              >
                <Save className="size-4 mr-2" />
                Save Draft
              </Button>
              <Button
                className="flex-1"
                onClick={() => saveBank(true)}
                disabled={saving || selectedQuestions.length === 0}
              >
                <Send className="size-4 mr-2" />
                Publish Bank
              </Button>
            </div>
          </GlassPanel>
        </div>
      </div>

      {previewLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <span className="rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm shadow">
            Loading preview...
          </span>
        </div>
      )}
      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        question={previewQuestion as any}
        onClose={() => setPreviewQuestion(null)}
      />
    </main>
  );
}
