"use client";

import { useState, useEffect, useCallback } from "react";
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
  // We need topics for the batch edit dropdown
  const [topics, setTopics] = useState<Topic[]>([]);
  const supabase = createClient();

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
  const [subjectFilter, setSubjectFilter] = useState("");
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

  // Batch Operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchDifficulty, setBatchDifficulty] = useState("");
  const [batchTopic, setBatchTopic] = useState("");
  const [batchTag, setBatchTag] = useState("");

  // const supabase = createClient(); // Moved up

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
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
        "id, subject_id, title, content, type, difficulty, options, topic_id, tags, created_at, subjects(name), topics(name)",
        { count: "exact" },
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
    if (debouncedSearch) {
      query = query.or(
        `title.ilike.%${debouncedSearch}%,content.ilike.%${debouncedSearch}%`,
      );
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
    supabase,
    itemsPerPage, // Add dependency
  ]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

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
              placeholder="Search title or content..."
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="opacity-50 hover:opacity-100"
                    >
                      {questions.length > 0 &&
                      selectedIds.size === questions.length ? (
                        <CheckSquare className="size-4 text-blue-600" />
                      ) : (
                        <Square className="size-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {sortColumn === "id" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        ))}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider">
                    Topic
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {sortColumn === "type" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort("difficulty")}
                  >
                    <div className="flex items-center gap-1">
                      Difficulty
                      {sortColumn === "difficulty" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        ))}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {questions.map((q) => {
                  const isChoiceType =
                    q.type === "single_choice" || q.type === "multiple_choice";
                  const contentPreview =
                    q.content.length > 220
                      ? `${q.content.slice(0, 220)}...`
                      : q.content;
                  return (
                    <tr
                      key={q.id}
                      onClick={() => toggleSelection(q.id)}
                      className={`transition-colors cursor-pointer ${
                        selectedIds.has(q.id)
                          ? "bg-blue-50/70 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-slate-800/30"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(q.id);
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          {selectedIds.has(q.id) ? (
                            <CheckSquare className="size-4 text-blue-600" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        #{q.id}
                      </td>
                      <td className="px-4 py-4">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-slate-900/60 p-3 space-y-2">
                          <p className="text-sm text-[#0d121b] dark:text-white whitespace-pre-line">
                            {contentPreview || "No content"}
                          </p>
                          {isChoiceType &&
                            q.options &&
                            q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.slice(0, 4).map((opt, idx) => {
                                  const optionPreview =
                                    opt.content.length > 80
                                      ? `${opt.content.slice(0, 80)}...`
                                      : opt.content;
                                  return (
                                    <div
                                      key={`${q.id}-${idx}`}
                                      className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/60 rounded-md px-2 py-1"
                                    >
                                      <span className="font-semibold">
                                        {opt.label}.
                                      </span>{" "}
                                      {optionPreview}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#4c669a] dark:text-gray-400">
                        {q.subjects?.name || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-500">
                        {q.topics?.name || "-"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {getTypeLabel(q.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(
                            q.difficulty,
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {q.tags && q.tags.length > 0 ? (
                            q.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                          {q.tags && q.tags.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{q.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewQuestion(q);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                            title="Preview"
                          >
                            <FileText className="size-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(q);
                            }}
                            disabled={editLoadingId === q.id}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50"
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
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="size-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(q.id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        onClose={() => setPreviewQuestion(null)}
      />
    </div>
  );
}
