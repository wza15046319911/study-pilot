"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
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
import QuestionList from "./QuestionList";
import { searchUsers } from "@/lib/actions/adminUnlock";
import { saveHomeworkDraft, pushHomework } from "./actions";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Search,
  CalendarClock,
  Users,
  Crown,
  X,
  ListChecks,
  Brain,
  GraduationCap,
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface HomeworkBuilderProps {
  subjects: Subject[];
  initialData?: any;
}

interface UserResult {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_vip?: boolean;
  email?: string | null;
}

const toDatetimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromDatetimeLocal = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default function HomeworkBuilder({
  subjects,
  initialData,
}: HomeworkBuilderProps) {
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
  const [dueAt, setDueAt] = useState<string>(
    toDatetimeLocal(initialData?.due_at),
  );
  const [allowedModes, setAllowedModes] = useState<string[]>(
    initialData?.allowed_modes || ["standard", "immersive", "flashcard"],
  );

  const [audienceType, setAudienceType] = useState<"all_premium" | "selected">(
    "all_premium",
  );
  const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([]);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(
    initialData?.questions || [],
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [userSearching, startUserSearch] = useTransition();

  const toggleMode = (mode: string) => {
    setAllowedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

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
      try {
        const [questionsRes, topicsRes] = await Promise.all([
          supabase
            .from("questions")
            .select("*")
            .eq("subject_id", sid)
            .order("type"),
          supabase
            .from("topics")
            .select("*")
            .eq("subject_id", sid)
            .order("name"),
        ]);

        if (questionsRes.error) {
          console.error("Error fetching questions:", questionsRes.error);
        }
        if (topicsRes.error) {
          console.error("Error fetching topics:", topicsRes.error);
        }

        setAvailableQuestions((questionsRes.data as Question[]) || []);
        setTopics((topicsRes.data as Topic[]) || []);
      } catch (error) {
        console.error("Error in fetchQuestionsAndTopics:", error);
      } finally {
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

  const handleSearchUsers = () => {
    if (userSearchQuery.length < 2) return;
    startUserSearch(async () => {
      const results = await searchUsers(userSearchQuery);
      setUserResults(results as UserResult[]);
    });
  };

  const addUser = (user: UserResult) => {
    if (user.is_vip === false) {
      alert("Only premium users can receive homework.");
      return;
    }
    if (selectedUsers.find((item) => item.id === user.id)) return;
    setSelectedUsers((prev) => [...prev, user]);
    setUserResults([]);
    setUserSearchQuery("");
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const saveHomework = async (publish: boolean) => {
    if (!subjectId || !title.trim() || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select questions.");
      return;
    }

    if (!dueAt) {
      alert("Please set a due date for this homework.");
      return;
    }

    if (allowedModes.length === 0) {
      alert("Please select at least one practice mode.");
      return;
    }

    if (publish && audienceType === "selected" && selectedUsers.length === 0) {
      alert("Please select at least one premium user to assign.");
      return;
    }

    setSaving(true);

    try {
      const finalSlug = slug.trim() || generateSlug(title.trim());
      const payload = {
        homeworkId: initialData?.id,
        subjectId: parseInt(subjectId),
        title: title.trim(),
        slug: finalSlug,
        description: description.trim(),
        dueAt: fromDatetimeLocal(dueAt),
        allowedModes,
        isPublished: publish,
        questionIds: selectedQuestions.map((q) => q.id),
      };

      if (publish) {
        const audience =
          audienceType === "all_premium"
            ? { type: "all_premium" as const }
            : {
                type: "selected" as const,
                userIds: selectedUsers.map((user) => user.id),
              };
        const result = await pushHomework(payload, audience);
        if (result.email?.errors?.length) {
          alert(
            `Homework pushed, but some emails failed:\n${result.email.errors
              .slice(0, 3)
              .join("\n")}`,
          );
        }
      } else {
        await saveHomeworkDraft(payload);
      }

      router.push("/admin/homework");
    } catch (error) {
      console.error(error);
      alert("Failed to save homework.");
      setSaving(false);
    }
  };

  const modeChips = [
    { id: "standard", label: "Standard", icon: ListChecks },
    { id: "immersive", label: "Immersive", icon: Brain },
    { id: "flashcard", label: "Flashcard", icon: GraduationCap },
  ];

  return (
    <main className="flex-grow w-full max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/homework">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {initialData ? "Edit Homework" : "Create Homework"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Premium-only homework sets with a clear deadline and targeted reach.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-3 space-y-6">
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Homework Details
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
                  placeholder="Homework title"
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
                  placeholder="homework-slug"
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
                  Due Date
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <CalendarClock className="size-4 text-slate-400" />
                  <Input
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Allowed Modes
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {modeChips.map((mode) => {
                    const Icon = mode.icon;
                    const active = allowedModes.includes(mode.id);
                    return (
                      <button
                        key={mode.id}
                        onClick={() => toggleMode(mode.id)}
                        className={`px-3 py-2 rounded-full text-xs font-semibold border transition-colors flex items-center gap-2 ${
                          active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                        }`}
                      >
                        <Icon className="size-3" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <Crown className="size-3" />
                Homework is premium-only and visible to assigned students.
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="size-4 text-slate-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Assign To
              </h2>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAudienceType("all_premium")}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  audienceType === "all_premium"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                All Premium Users
              </button>
              <button
                onClick={() => setAudienceType("selected")}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  audienceType === "selected"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                Selected Users
              </button>
            </div>

            {audienceType === "selected" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchUsers()}
                    placeholder="Search premium users..."
                  />
                  <Button
                    onClick={handleSearchUsers}
                    disabled={userSearching || userSearchQuery.length < 2}
                    className="gap-2"
                  >
                    <Search className="size-4" />
                    Search
                  </Button>
                </div>

                {userResults.length > 0 && (
                  <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-2 max-h-48 overflow-y-auto">
                    {userResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => addUser(user)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        {user.avatar_url ? (
                          <div
                            className="size-8 rounded-full bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${user.avatar_url}")`,
                            }}
                          />
                        ) : (
                          <div className="size-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.username?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.username || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.email || "Email unavailable"} ·{" "}
                            {user.is_vip ? "Premium" : "Not premium"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
                      >
                        <span className="font-semibold">
                          {user.username || "User"}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {user.email || "Email unavailable"}
                        </span>
                        <button onClick={() => removeUser(user.id)}>
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Right Column */}
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
              onClick={() => saveHomework(false)}
              disabled={saving}
              className="gap-2"
            >
              <Save className="size-4" />
              Save Draft
            </Button>
            <Button
              onClick={() => saveHomework(true)}
              disabled={saving}
              className="gap-2"
            >
              <Send className="size-4" />
              Push Homework
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
