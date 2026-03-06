"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  updateQuestion,
  deleteQuestion,
  batchUpdateQuestions,
  batchAddTags,
  duplicateQuestion,
  batchDeleteQuestions,
  getQuestionUsage,
  batchGetQuestionUsageStatus,
  type QuestionUsage,
} from "./actions";

// Lazy-load modals (EditQuestionModal is heavy, defer until needed)
const EditQuestionModal = dynamic(() => import("./EditQuestionModal"), {
  ssr: false,
});
const QuestionPreviewModal = dynamic(
  () => import("./QuestionPreviewModal"),
  { ssr: false },
);

import {
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Tag,
  Database,
  Loader2,
  CheckSquare,
  Square,
  Settings2,
  Plus,
  Copy,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
  subject_id: number;
}

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
  topics?: { name: string };
}

interface QuestionsClientProps {
  subjects: Subject[];
}

// Removed constant
// const ITEMS_PER_PAGE = 20;

const questionTypes = [
  { value: "", label: "All Types" },
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "fill_blank", label: "Fill in Blank" },
  { value: "code_output", label: "Code Output" },
  { value: "coding_challenge", label: "Coding Challenge" },
  { value: "handwrite", label: "Handwrite" },
  { value: "true_false", label: "True/False" },
];

const difficultyOptions = [
  { value: "", label: "All Difficulties" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function QuestionsClient({ subjects }: QuestionsClientProps) {
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // We need topics for the batch edit dropdown
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    async function fetchTopics() {
      const { data } = await supabase.from("topics").select("*");
      if (data) setTopics(data);
    }
    fetchTopics();
  }, [supabase]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Dynamic items per page
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filters
  const [subjectFilter, setSubjectFilter] = useState(() => {
    const defaultSubject = subjects.find(s => s.name.toLowerCase().includes("csse1001"));
    return defaultSubject ? defaultSubject.id.toString() : "";
  });
  const [typeFilter, setTypeFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Edit modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preview modal
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [previewUsage, setPreviewUsage] = useState<QuestionUsage | undefined>(
    undefined,
  );

  // Orphan status map
  const [orphanStatus, setOrphanStatus] = useState<Record<number, boolean>>({});

  // Batch Operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchDifficulty, setBatchDifficulty] = useState("");
  const [batchTopic, setBatchTopic] = useState("");
  const [batchTag, setBatchTag] = useState("");

  // const supabase = createClient(); // Moved up

  // Debounce search (500ms to reduce rapid requests; title-only search is fast with index)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!topicFilter || !subjectFilter) return;
    const topicMatchesSubject = topics.some(
      (t) =>
        t.id === parseInt(topicFilter) &&
        t.subject_id === parseInt(subjectFilter),
    );
    if (!topicMatchesSubject) {
      setTopicFilter("");
    }
  }, [subjectFilter, topicFilter, topics]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]',
        ) as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }

      // Escape: Clear selection
      if (e.key === "Escape" && selectedIds.size > 0) {
        e.preventDefault();
        setSelectedIds(new Set());
      }

      // Delete/Backspace: Bulk delete (with selection)
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedIds.size > 0
      ) {
        e.preventDefault();
        handleBatchDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds]);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("questions")
      .select(
        "id, subject_id, title, content, type, difficulty, options, code_snippet, topic_id, tags, created_at, subjects(name), topics(name)",
        { count: "estimated" },
      );

    if (subjectFilter) {
      query = query.eq("subject_id", parseInt(subjectFilter));
    }
    if (typeFilter) {
      query = query.eq("type", typeFilter);
    }
    if (difficultyFilter) {
      query = query.eq("difficulty", difficultyFilter);
    }
    if (topicFilter) {
      query = query.eq("topic_id", parseInt(topicFilter));
    }
    // Search title only - content.ilike on large text causes full table scan and freezes
    if (debouncedSearch) {
      query = query.ilike("title", `%${debouncedSearch}%`);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, count, error } = await query
      .order(sortColumn, { ascending: sortDirection === "asc" })
      .range(from, to);

    if (!error && data) {
      setQuestions(data as Question[]);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [
    subjectFilter,
    typeFilter,
    difficultyFilter,
    topicFilter,
    debouncedSearch,
    currentPage,
    sortColumn,
    sortDirection,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Fetch orphan status whenever questions change
  useEffect(() => {
    if (questions.length === 0) {
      setOrphanStatus({});
      return;
    }

    const ids = questions.map((q) => q.id);
    batchGetQuestionUsageStatus(ids).then((res) => {
      if (res.success && res.data) {
        setOrphanStatus(res.data);
      }
    });
  }, [questions]);

  // Handle sort click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc"); // Default to asc for new column
    }
  };

  // Reset page and selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [subjectFilter, typeFilter, difficultyFilter, itemsPerPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const [editLoadingId, setEditLoadingId] = useState<number | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<number | null>(
    null,
  );
  const previewRequestSeqRef = useRef(0);

  const handlePreview = async (question: Question) => {
    const requestSeq = previewRequestSeqRef.current + 1;
    previewRequestSeqRef.current = requestSeq;

    setPreviewLoadingId(question.id);
    setPreviewQuestion(null);
    setPreviewUsage(undefined);

    try {
      const [fullRes, usageRes] = await Promise.all([
        supabase.from("questions").select("*").eq("id", question.id).single(),
        getQuestionUsage(question.id),
      ]);

      // Ignore stale responses from older clicks to prevent cross-question preview mix-ups.
      if (previewRequestSeqRef.current !== requestSeq) {
        return;
      }

      const { data: full } = fullRes;
      if (full) {
        setPreviewQuestion(full as Question);
      }
      if (usageRes.success && usageRes.data) {
        setPreviewUsage(usageRes.data);
      }
    } finally {
      if (previewRequestSeqRef.current === requestSeq) {
        setPreviewLoadingId(null);
      }
    }
  };

  const handleEdit = async (question: Question) => {
    setEditLoadingId(question.id);
    try {
      const { data: full } = await supabase
        .from("questions")
        .select("*")
        .eq("id", question.id)
        .single();
      if (full) {
        setEditingQuestion(full as Question);
        setIsModalOpen(true);
      }
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleSave = async (updatedQuestion: Partial<Question>) => {
    if (!editingQuestion) return;

    console.log("Saving question update:", updatedQuestion);

    const result = await updateQuestion(
      editingQuestion.id,
      updatedQuestion as any,
    );

    if (result.success) {
      console.log("Update successful:", result.data);

      // Update local state without re-fetching
      if (result.data) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === editingQuestion.id ? { ...q, ...result.data } : q,
          ),
        );
      }

      setIsModalOpen(false);
      setEditingQuestion(null);
      // Removed fetchQuestions() to prevent page refresh/loading state
    } else {
      console.error("Update error:", result.error);
      alert(`Failed to save: ${result.error}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const result = await deleteQuestion(id);
    if (result.success) {
      fetchQuestions();
    } else {
      alert(`Failed to delete: ${result.error}`);
    }
  };

  // Batch Actions
  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      const all = new Set(questions.map((q) => q.id));
      setSelectedIds(all);
    }
  };

  const handleBatchDifficulty = async (diff: string) => {
    if (!diff || selectedIds.size === 0) return;
    if (
      !confirm(
        `Update difficulty for ${selectedIds.size} questions to ${diff}?`,
      )
    )
      return;

    const result = await batchUpdateQuestions(Array.from(selectedIds), {
      difficulty: diff as any,
    });
    if (result.success) {
      // Optimistic update
      setQuestions((prev) =>
        prev.map((q) =>
          selectedIds.has(q.id) ? { ...q, difficulty: diff } : q,
        ),
      );
      setBatchDifficulty("");
      setSelectedIds(new Set());
    } else {
      alert("Batch update failed");
    }
  };

  const handleBatchTopic = async (topicIdStr: string) => {
    if (!topicIdStr || selectedIds.size === 0) return;
    const topicId = parseInt(topicIdStr);
    if (!confirm(`Update topic for ${selectedIds.size} questions?`)) return;

    const result = await batchUpdateQuestions(Array.from(selectedIds), {
      topic_id: topicId,
    });
    if (result.success) {
      fetchQuestions(); // Hard to optimistic update exact topic name without lookup, re-fetching is safer
      setBatchTopic("");
      setSelectedIds(new Set());
    } else {
      alert("Batch update failed");
    }
  };

  const handleBatchAddTag = async () => {
    const tag = batchTag.trim().toLowerCase();
    if (!tag || selectedIds.size === 0) return;

    // Optimistic UI not easy for array append, let's wait
    const result = await batchAddTags(Array.from(selectedIds), [tag]);
    if (result.success) {
      fetchQuestions();
      setBatchTag("");
      setSelectedIds(new Set());
    } else {
      alert("Batch tag add failed");
    }
  };

  const handleDuplicate = async (id: number) => {
    const result = await duplicateQuestion(id);
    if (result.success) {
      fetchQuestions();
    } else {
      alert("Failed to duplicate question");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `Delete ${selectedIds.size} selected question(s)? This cannot be undone.`,
      )
    )
      return;

    const result = await batchDeleteQuestions(Array.from(selectedIds));
    if (result.success) {
      setQuestions((prev) => prev.filter((q) => !selectedIds.has(q.id)));
      setSelectedIds(new Set());
      setTotalCount((prev) => prev - (result.count || 0));
    } else {
      alert("Batch delete failed");
    }
  };

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

  const getTypeLabel = (type: string) => {
    const found = questionTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            <Database className="size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
              Questions Manager
            </h1>
            <p className="text-[#4c669a] dark:text-gray-400">
              {totalCount} questions total
            </p>
          </div>
        </div>

        {/* Batch Toolbar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-blue-100 dark:border-blue-900 animate-in slide-in-from-top-2 z-20">
            <div className="flex items-center gap-2 px-2 text-sm font-medium text-blue-600">
              <CheckSquare className="size-4" />
              {selectedIds.size} Selected
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

            <Select
              value={batchDifficulty}
              onChange={(e: any) => handleBatchDifficulty(e.target.value)}
              options={[
                { value: "", label: "Set Difficulty..." },
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
              className="w-40 h-9 text-sm"
            />

            <Select
              value={batchTopic}
              onChange={(e: any) => handleBatchTopic(e.target.value)}
              options={[
                { value: "", label: "Set Topic..." },
                // Filter topics by current subject filter if active
                ...topics
                  .filter(
                    (t) =>
                      !subjectFilter ||
                      t.subject_id === parseInt(subjectFilter),
                  )
                  .map((t) => ({ value: t.id, label: t.name })),
              ]}
              className="w-40 h-9 text-sm"
            />

            <div className="flex items-center gap-1">
              <Input
                value={batchTag}
                onChange={(e) => setBatchTag(e.target.value)}
                placeholder="Add Tag"
                className="w-32 h-9 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleBatchAddTag()}
              />
              <Button
                size="sm"
                onClick={handleBatchAddTag}
                className="h-9 w-9 p-0"
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchDelete}
              className="h-9 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
            >
              <Trash2 className="size-4 mr-1" />
              Delete ({selectedIds.size})
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <GlassPanel className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-[#4c669a] dark:text-gray-400">
            <Filter className="size-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            options={[
              { value: "", label: "All Subjects" },
              ...subjects.map((s) => ({ value: s.id, label: s.name })),
            ]}
            className="w-48"
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={questionTypes}
            className="w-44"
          />

          <Select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            options={difficultyOptions}
            className="w-40"
          />

          <Select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            options={[
              { value: "", label: "All Topics" },
              ...topics
                .filter(
                  (t) =>
                    !subjectFilter || t.subject_id === parseInt(subjectFilter),
                )
                .map((t) => ({ value: t.id, label: t.name })),
            ]}
            className="w-48"
          />

          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Questions Table */}
      <GlassPanel className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-blue-500" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 text-[#4c669a] dark:text-gray-400">
            <Database className="size-12 mx-auto mb-4 opacity-50" />
            <p>No questions found matching your criteria</p>
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 dark:bg-slate-800/50 text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={toggleSelectAll}
                className="opacity-50 hover:opacity-100 flex-shrink-0"
              >
                {questions.length > 0 &&
                selectedIds.size === questions.length ? (
                  <CheckSquare className="size-4 text-blue-600" />
                ) : (
                  <Square className="size-4" />
                )}
              </button>
              <span className="ml-2 hidden sm:inline">Sort by:</span>
              <button
                onClick={() => handleSort("id")}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                ID
                {sortColumn === "id" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  ))}
              </button>
              <button
                onClick={() => handleSort("type")}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Type
                {sortColumn === "type" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  ))}
              </button>
              <button
                onClick={() => handleSort("difficulty")}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Difficulty
                {sortColumn === "difficulty" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  ))}
              </button>
              <button
                onClick={() => handleSort("created_at")}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Date
                {sortColumn === "created_at" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  ))}
              </button>
            </div>
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
              {questions.map((q) => {
                const isChoiceType =
                  q.type === "single_choice" || q.type === "multiple_choice";
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleSelection(q.id)}
                    className={`flex flex-col p-4 transition-colors cursor-pointer ${
                      selectedIds.has(q.id)
                        ? "bg-blue-50/70 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(q.id);
                          }}
                          className="text-gray-400 hover:text-blue-600 mr-1"
                        >
                          {selectedIds.has(q.id) ? (
                            <CheckSquare className="size-4 text-blue-600" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                        <span className="font-mono text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          #{q.id}
                          {orphanStatus[q.id] && (
                            <div title="Orphan: Not referenced anywhere">
                              <AlertCircle className="size-3.5 text-amber-500" />
                            </div>
                          )}
                        </span>
                        <span className="text-sm font-medium text-[#4c669a] dark:text-gray-300 ml-1">
                          {q.subjects?.name || "-"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {q.topics?.name || "-"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ml-1">
                          {getTypeLabel(q.type)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(
                            q.difficulty,
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(q);
                          }}
                          disabled={previewLoadingId === q.id}
                          className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50"
                          title="Preview"
                        >
                          {previewLoadingId === q.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <FileText className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(q);
                          }}
                          disabled={editLoadingId === q.id}
                          className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50"
                          title="Edit"
                        >
                          {editLoadingId === q.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Edit2 className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(q.id);
                          }}
                          className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="size-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(q.id);
                          }}
                          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <div 
                      className="pl-[34px] mb-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(q);
                      }}
                    >
                      {q.title && (
                        <h3 className="font-bold text-base text-[#0d121b] dark:text-white mb-1">
                          {q.title}
                        </h3>
                      )}
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-snug">
                        {q.content || "No content"}
                      </div>

                      {/* Render code snippet if it exists */}
                      {q.code_snippet && (
                        <div className="mt-3 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-[#0d1117] relative">
                          <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                            <code>{q.code_snippet}</code>
                          </pre>
                        </div>
                      )}
                      
                      {isChoiceType && q.options && q.options.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          {q.options.map((opt, idx) => (
                            <div
                              key={`${q.id}-${idx}`}
                              className="text-sm text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-slate-900/60 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1.5 flex items-start gap-2"
                            >
                              <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                                {opt.label}.
                              </span>
                              <span className="break-words leading-tight">{opt.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pl-[34px] mt-1 flex flex-wrap gap-1.5">
                      {q.tags && q.tags.length > 0 ? (
                        q.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No tags</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-[#4c669a] dark:text-gray-400">
            Showing {totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
            to {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
            {totalCount}
          </p>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm text-[#4c669a] dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
              </>
            )}

            <Select
              value={itemsPerPage.toString()}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              options={[
                { value: 20, label: "20 / page" },
                { value: 50, label: "50 / page" },
                { value: 100, label: "100 / page" },
                { value: 200, label: "200 / page" },
                { value: 500, label: "500 / page" },
              ]}
              className="w-32 h-9 text-sm"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Edit Modal */}
      <EditQuestionModal
        isOpen={isModalOpen}
        question={editingQuestion}
        topics={topics}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSave}
      />

      {/* Preview Modal */}
      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        question={previewQuestion}
        onClose={() => {
          previewRequestSeqRef.current += 1;
          setPreviewQuestion(null);
          setPreviewUsage(undefined);
          setPreviewLoadingId(null);
        }}
        usage={previewUsage}
      />
    </div>
  );
}
