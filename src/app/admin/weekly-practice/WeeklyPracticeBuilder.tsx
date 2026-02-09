"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Question, Topic } from "@/types/database";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LatexContent } from "@/components/ui/LatexContent";
import { CodeBlock } from "@/components/ui/CodeBlock";
import QuestionPreviewModal from "@/app/admin/questions/QuestionPreviewModal";
import QuestionList from "../homework/QuestionList";
import { createWeeklyPractice, updateWeeklyPractice } from "./actions";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calendar,
  ListChecks,
  Sparkles,
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface WeeklyPracticeBuilderProps {
  subjects: Subject[];
  initialData?: any;
}

const toDateInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const fromDateInput = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default function WeeklyPracticeBuilder({
  subjects,
  initialData,
}: WeeklyPracticeBuilderProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [subjectId, setSubjectId] = useState<string>(
    initialData?.subject_id?.toString() || "",
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [weekStart, setWeekStart] = useState<string>(
    toDateInput(initialData?.week_start),
  );

  const [topics, setTopics] = useState<Topic[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(
    initialData?.questions || [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const filteredQuestions = useMemo(() => {
    return availableQuestions.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || q.type === typeFilter;
      const matchesTopic =
        topicFilter === "all" || q.topic_id?.toString() === topicFilter;
      return matchesSearch && matchesType && matchesTopic;
    });
  }, [availableQuestions, searchQuery, typeFilter, topicFilter]);

  useEffect(() => {
    if (!subjectId) {
      setAvailableQuestions([]);
      return;
    }

    const sid = parseInt(subjectId);
    if (isNaN(sid)) {
      setAvailableQuestions([]);
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
              "id, subject_id, title, content, type, difficulty, options, code_snippet, topic_id",
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

  const addQuestion = useCallback((question: Question) => {
    setSelectedQuestions((prev) => {
      if (prev.find((q) => q.id === question.id)) return prev;
      return [...prev, question];
    });
  }, []);

  const removeQuestion = useCallback((question: Question) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== question.id));
  }, []);

  const saveWeeklyPractice = async (publish: boolean) => {
    if (!subjectId || !title.trim() || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select questions.");
      return;
    }

    setSaving(true);

    try {
      const finalSlug = slug.trim() || generateSlug(title.trim());
      const payload = {
        weeklyPracticeId: initialData?.id,
        subjectId: parseInt(subjectId),
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        weekStart: fromDateInput(weekStart),
        allowedModes: ["standard"],
        isPublished: publish,
        questionIds: selectedQuestions.map((q) => q.id),
      };

      if (initialData) {
        await updateWeeklyPractice(payload);
      } else {
        await createWeeklyPractice(payload);
      }

      router.push("/admin/weekly-practice");
    } catch (error) {
      console.error(error);
      alert("Failed to save weekly practice.");
      setSaving(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/weekly-practice">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {initialData ? "Edit Weekly Practice" : "Create Weekly Practice"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Publish a short, public practice set for the week.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Weekly Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Subject
                </label>
                <Select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="mt-2"
                  options={[
                    { value: "", label: "Select subject" },
                    ...subjects.map((subject) => ({
                      value: subject.id,
                      label: subject.name,
                    })),
                  ]}
                  placeholder="Select subject"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug) {
                      setSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="Weekly practice title"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Slug
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="weekly-practice-slug"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary (optional)"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Week of
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Calendar className="size-4 text-slate-400" />
                  <Input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
                <Sparkles className="size-4 text-amber-500" />
                Aim for 8-15 questions so students can finish in 10-15 minutes.
              </div>

              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2">
                <ListChecks className="size-4" />
                Weekly practice runs in a simple standard session only.
              </div>
            </div>
          </GlassPanel>
        </div>

        <div className="xl:col-span-9 space-y-6">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Questions
              </h2>
              <div className="text-xs text-slate-500">
                {selectedQuestions.length} selected
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
              />
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: "all", label: "All types" },
                  { value: "single_choice", label: "Single Choice" },
                  { value: "multiple_choice", label: "Multiple Choice" },
                  { value: "fill_blank", label: "Fill Blank" },
                  { value: "code_output", label: "Code Output" },
                  { value: "handwrite", label: "Handwrite" },
                  { value: "true_false", label: "True/False" },
                ]}
                placeholder="All types"
              />
              <Select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                options={[
                  { value: "all", label: "All topics" },
                  ...topics.map((topic) => ({
                    value: topic.id,
                    label: topic.name,
                  })),
                ]}
                placeholder="All topics"
              />
            </div>
            {loadingError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {loadingError}
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-[calc(100vh-350px)] overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Available Questions
                </h3>
                <QuestionList
                  questions={filteredQuestions}
                  onAction={addQuestion}
                  onPreview={setPreviewQuestion}
                  actionIcon="plus"
                  emptyMessage="No questions found."
                  loading={loading}
                />
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 h-[calc(100vh-350px)] overflow-y-auto">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                  Selected Questions
                </h3>
                <QuestionList
                  questions={selectedQuestions}
                  onAction={removeQuestion}
                  onPreview={setPreviewQuestion}
                  actionIcon="trash"
                  emptyMessage="No questions selected yet."
                />
              </div>
            </div>
          </GlassPanel>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => saveWeeklyPractice(false)}
              disabled={saving}
              className="gap-2"
            >
              <Save className="size-4" />
              Save Draft
            </Button>
            <Button
              onClick={() => saveWeeklyPractice(true)}
              disabled={saving}
              className="gap-2"
            >
              <Send className="size-4" />
              Publish
            </Button>
          </div>
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
