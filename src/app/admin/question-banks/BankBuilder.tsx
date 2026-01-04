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
} from "lucide-react";
import { LatexContent } from "@/components/ui/LatexContent";
import { CodeBlock } from "@/components/ui/CodeBlock";
import QuestionPreviewModal from "@/app/admin/questions/QuestionPreviewModal";

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
    initialData?.subject_id?.toString() || ""
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [unlockType, setUnlockType] = useState<"free" | "premium" | "referral">(
    initialData?.unlock_type || "free"
  );

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
    initialData?.questions || []
  );

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

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

  const addQuestion = (question: Question) => {
    if (selectedQuestions.find((q) => q.id === question.id)) return;
    setSelectedQuestions((prev) => [...prev, question]);
  };

  const removeQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const saveBank = async (publish: boolean) => {
    if (!subjectId || !title.trim() || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select questions.");
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
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
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
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
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all ${
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
              ) : filteredQuestions.length === 0 ? (
                <p className="text-center py-10 text-gray-400 italic">
                  No questions found
                </p>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedQuestions.find((sq) => sq.id === q.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : "bg-white dark:bg-slate-800 border-gray-100 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setPreviewQuestion(q)}
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
                        !!selectedQuestions.find((sq) => sq.id === q.id)
                      }
                      className="shrink-0 p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="size-4" />
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
                          <div className="text-xs mb-2">
                            <CodeBlock
                              code={q.code_snippet}
                              language="python"
                            />
                          </div>
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
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
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

      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        question={previewQuestion as any}
        onClose={() => setPreviewQuestion(null)}
      />
    </main>
  );
}
