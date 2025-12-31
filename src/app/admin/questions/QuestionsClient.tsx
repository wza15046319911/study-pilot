"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import EditQuestionModal from "./EditQuestionModal";
import { updateQuestion, deleteQuestion } from "./actions";
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
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
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
  created_at: string;
  subjects?: { name: string };
}

interface QuestionsClientProps {
  subjects: Subject[];
}

const ITEMS_PER_PAGE = 20;

const questionTypes = [
  { value: "", label: "All Types" },
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "fill_blank", label: "Fill in Blank" },
  { value: "code_output", label: "Code Output" },
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filters
  const [subjectFilter, setSubjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Edit modal
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const supabase = createClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("questions")
      .select("*, subjects(name)", { count: "exact" });

    if (subjectFilter) {
      query = query.eq("subject_id", parseInt(subjectFilter));
    }
    if (typeFilter) {
      query = query.eq("type", typeFilter);
    }
    if (difficultyFilter) {
      query = query.eq("difficulty", difficultyFilter);
    }
    if (debouncedSearch) {
      query = query.or(
        `title.ilike.%${debouncedSearch}%,content.ilike.%${debouncedSearch}%`
      );
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

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
    debouncedSearch,
    currentPage,
    sortColumn,
    sortDirection,
    supabase,
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [subjectFilter, typeFilter, difficultyFilter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedQuestion: Partial<Question>) => {
    if (!editingQuestion) return;

    console.log("Saving question update:", updatedQuestion);

    const result = await updateQuestion(
      editingQuestion.id,
      updatedQuestion as any
    );

    if (result.success) {
      console.log("Update successful:", result.data);
      setIsModalOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
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
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1">
                      Title
                      {sortColumn === "title" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        ))}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#4c669a] dark:text-gray-400 uppercase tracking-wider">
                    Subject
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
                {questions.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                      #{q.id}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-[#0d121b] dark:text-white line-clamp-2 max-w-md">
                        {q.title}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#4c669a] dark:text-gray-400">
                      {q.subjects?.name || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {getTypeLabel(q.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(
                          q.difficulty
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
                          onClick={() => handleEdit(q)}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-[#4c669a] dark:text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-[#0d121b] dark:text-white px-3">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </GlassPanel>

      {/* Edit Modal */}
      <EditQuestionModal
        isOpen={isModalOpen}
        question={editingQuestion}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
