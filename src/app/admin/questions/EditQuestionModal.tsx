"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { TestCaseEditor, TestCasesConfig } from "@/components/admin/TestCaseEditor";
import {
  X,
  Save,
  Tag,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Code2,
  Type,
  CloudOff,
  Check,
  Download,
  Bookmark,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import TemplatesModal from "./TemplatesModal";

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
  test_cases: TestCasesConfig | null;
  created_at: string;
}

interface Topic {
  id: number;
  name: string;
  subject_id: number;
}

interface EditQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  topics: Topic[];
  onClose: () => void;
  onSave: (updated: Partial<Question>) => void;
}

const presetTags = [
  "arithmetic operation",
  "boolean operation",
  "relational operation",
  "if-elif-else",
  "for loop",
  "while loop",
  "data types",
  "string",
  "list",
  "tuple",
  "dictionary",
  "functions",
  "type hint",
  "scope of variable",
  "class",
  "mro",
  "advanced functions",
  "files",
  "midterm",
  "final",
  "slicing",
  "range",
  "list comprehension",
  "lambda function"
];

export default function EditQuestionModal({
  isOpen,
  question,
  topics,
  onClose,
  onSave,
}: EditQuestionModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [topicId, setTopicId] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [options, setOptions] = useState<{ label: string; content: string }[]>(
    []
  );
  const [testCases, setTestCases] = useState<TestCasesConfig>({
    function_name: "solution",
    test_cases: [],
  });
  const [codeEditorMode, setCodeEditorMode] = useState<"code" | "text">("code");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | null>(
    null
  );
  const [hasDraft, setHasDraft] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Draft key for localStorage
  const draftKey = question
    ? `question-draft-${question.id}`
    : "question-draft-new";

  // Check for existing draft on mount
  useEffect(() => {
    if (isOpen && question) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        setHasDraft(true);
      }
    }
  }, [isOpen, question, draftKey]);

  // Initialize form when question changes
  useEffect(() => {
    if (question) {
      setTitle(question.title || "");
      setContent(question.content || "");
      setAnswer(question.answer || "");
      setExplanation(question.explanation || "");
      setDifficulty(question.difficulty as "easy" | "medium" | "hard");
      setTopicId(question.topic_id ? String(question.topic_id) : "");
      setCodeSnippet(question.code_snippet || "");
      setTags(question.tags || []);
      setOptions(question.options || []);
      setTestCases(
        question.test_cases || {
          function_name: "solution",
          test_cases: [],
        }
      );
      setFormError(null);
      setHasDraft(false);
    }
  }, [question]);

  // Auto-save draft (debounced)
  useEffect(() => {
    if (!isOpen || !question) return;

    setDraftStatus("saving");
    const timer = setTimeout(() => {
      const draft = {
        title,
        content,
        answer,
        explanation,
        difficulty,
        topicId,
        codeSnippet,
        tags,
        options,
        testCases,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setDraftStatus("saved");
      setTimeout(() => setDraftStatus(null), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    title,
    content,
    answer,
    explanation,
    difficulty,
    topicId,
    codeSnippet,
    tags,
    options,
    testCases,
    isOpen,
    question,
    draftKey,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const form = document.querySelector("form");
        if (form) form.requestSubmit();
      }
      // Escape to close
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Restore draft
  const restoreDraft = useCallback(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setTitle(draft.title || "");
      setContent(draft.content || "");
      setAnswer(draft.answer || "");
      setExplanation(draft.explanation || "");
      setDifficulty(draft.difficulty || "medium");
      setTopicId(draft.topicId || "");
      setCodeSnippet(draft.codeSnippet || "");
      setTags(draft.tags || []);
      setOptions(draft.options || []);
      setTestCases(
        draft.testCases || {
          function_name: "solution",
          test_cases: [],
        }
      );
      setHasDraft(false);
    }
  }, [draftKey]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setHasDraft(false);
  }, [draftKey]);

  // Handle loading template
  const handleLoadTemplate = useCallback((template: unknown) => {
    if (typeof template !== "object" || template === null) return;
    const data = template as {
      difficulty?: "easy" | "medium" | "hard";
      contentStructure?: string;
      tags?: string[];
    };
    if (data.difficulty) setDifficulty(data.difficulty);
    if (data.contentStructure) setContent(data.contentStructure);
    if (data.tags) setTags(data.tags);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const isChoiceType =
      question?.type === "single_choice" ||
      question?.type === "multiple_choice";
    const isCodingChallenge = question?.type === "coding_challenge";

    if (isCodingChallenge) {
      if (!testCases.function_name.trim()) {
        setFormError("Function name is required for coding challenge.");
        return;
      }
      if (testCases.test_cases.length === 0) {
        setFormError("At least one test case is required for coding challenge.");
        return;
      }
      if (testCases.test_cases.some((testCase) => !Array.isArray(testCase.input))) {
        setFormError("Every coding challenge test case input must be a JSON array.");
        return;
      }
    }

    setSaving(true);

    const updated: Partial<Question> = {
      title,
      content,
      answer: isCodingChallenge ? "all_tests_passed" : answer,
      explanation: explanation || null,
      difficulty,
      topic_id: topicId ? parseInt(topicId, 10) : null,
      code_snippet: codeSnippet || null,
      tags: tags.length > 0 ? tags : null,
      options: isChoiceType ? options : null,
      test_cases: isCodingChallenge
        ? {
            ...testCases,
            function_name: testCases.function_name.trim(),
          }
        : null,
    };

    try {
      await onSave(updated);
      clearDraft(); // Clear draft on successful save
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save question.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  const addPresetTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const updateOption = (
    index: number,
    field: "label" | "content",
    value: string
  ) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length); // A, B, C, D...
    setOptions([...options, { label: nextLabel, content: "" }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const moveOption = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= options.length) return;

    const updated = [...options];
    // Swap the options
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Re-assign labels A, B, C, D...
    updated.forEach((opt, i) => {
      opt.label = String.fromCharCode(65 + i);
    });
    setOptions(updated);
  };

  const isChoiceType =
    question?.type === "single_choice" || question?.type === "multiple_choice";

  if (!isOpen || !question) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
                    Edit Question #{question.id}
                  </h2>
                  <p className="text-sm text-[#4c669a] dark:text-gray-400">
                    Type: {question.type}
                    <span className="text-xs text-gray-400 ml-2">
                      (⌘S to save, Esc to close)
                    </span>
                  </p>
                </div>

                {/* Draft Status */}
                {draftStatus && (
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      draftStatus === "saving"
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {draftStatus === "saving" ? (
                      <>
                        <CloudOff className="size-3" /> Saving…
                      </>
                    ) : (
                      <>
                        <Check className="size-3" /> Draft saved
                      </>
                    )}
                  </span>
                )}

                {/* Restore Draft Button */}
                {hasDraft && (
                  <button
                    type="button"
                    onClick={restoreDraft}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    <Download className="size-3" />
                    Restore Draft
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Question title..."
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Content
                    </label>
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Question content... (supports Markdown)"
                      minHeight="150px"
                    />
                  </div>

                  {/* Options (for choice questions) */}
                  {isChoiceType && (
                    <div>
                      <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {options.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => moveOption(idx, -1)}
                                disabled={idx === 0}
                                className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveOption(idx, 1)}
                                disabled={idx === options.length - 1}
                                className="p-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="size-4" />
                              </button>
                            </div>
                            <span className="w-8 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded text-sm font-bold text-[#4c669a]">
                              {opt.label}
                            </span>
                            <Input
                              value={opt.content}
                              onChange={(e) =>
                                updateOption(idx, "content", e.target.value)
                              }
                              placeholder={`Option ${opt.label} content...`}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={addOption}
                        >
                          <Plus className="size-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Answer */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Answer
                    </label>
                    <Input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={
                        isChoiceType ? "e.g., A" : "Expected answer..."
                      }
                    />
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Difficulty
                    </label>
                    <Select
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(
                          e.target.value as "easy" | "medium" | "hard"
                        )
                      }
                      options={[
                        { value: "easy", label: "Easy" },
                        { value: "medium", label: "Medium" },
                        { value: "hard", label: "Hard" },
                      ]}
                    />
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Topic
                    </label>
                    <Select
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                      options={[
                        { value: "", label: "No Topic" },
                        ...topics
                          .filter(
                            (topic) => topic.subject_id === question.subject_id
                          )
                          .map((topic) => ({
                            value: String(topic.id),
                            label: topic.name,
                          })),
                      ]}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Code Snippet */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-[#4c669a] dark:text-gray-400">
                        Code Snippet
                      </label>
                      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setCodeEditorMode("code")}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-[color,background-color,box-shadow] ${
                            codeEditorMode === "code"
                              ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          <Code2 className="size-3.5" />
                          Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setCodeEditorMode("text")}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-[color,background-color,box-shadow] ${
                            codeEditorMode === "text"
                              ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          <Type className="size-3.5" />
                          Text
                        </button>
                      </div>
                    </div>

                    {codeEditorMode === "code" ? (
                      <div className="h-[200px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <Editor
                          height="100%"
                          defaultLanguage="python"
                          theme="vs-dark"
                          value={codeSnippet}
                          onChange={(value) => setCodeSnippet(value || "")}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 10, bottom: 10 },
                          }}
                        />
                      </div>
                    ) : (
                      <Textarea
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                        placeholder="Code snippet (if any)..."
                        className="min-h-[200px] font-mono text-sm"
                      />
                    )}
                  </div>

                  {/* Explanation */}
                  {question.type === "coding_challenge" && (
                    <div>
                      <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                        Test Cases
                      </label>
                      <TestCaseEditor
                        value={testCases}
                        onChange={setTestCases}
                        disabled={saving}
                      />
                    </div>
                  )}

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Explanation
                    </label>
                    <MarkdownEditor
                      value={explanation}
                      onChange={setExplanation}
                      placeholder="Explanation for the answer... (supports Markdown)"
                      minHeight="120px"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      <Tag className="size-4 inline mr-1" />
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addTag}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-[#4c669a] dark:text-gray-400 mb-2">
                        Preset tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {presetTags.map((tag) => {
                          const isSelected = tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addPresetTag(tag)}
                              disabled={isSelected}
                              className={`px-2 py-1 rounded-full text-xs border transition ${
                                isSelected
                                  ? "bg-purple-100 text-purple-700 border-purple-200 cursor-default dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                                  : "bg-white text-[#4c669a] border-gray-200 hover:border-purple-300 hover:text-purple-700 dark:bg-slate-800 dark:text-gray-300 dark:border-gray-700 dark:hover:border-purple-700"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                  {formError}
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTemplatesOpen(true)}
              >
                <Bookmark className="size-4 mr-2" />
                Templates
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  <Save className="size-4 mr-2" />
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>

            {/* Templates Modal */}
            <TemplatesModal
              isOpen={templatesOpen}
              onClose={() => setTemplatesOpen(false)}
              onLoadTemplate={handleLoadTemplate}
              currentData={
                question
                  ? {
                      type: question.type,
                      difficulty,
                      content,
                      tags,
                    }
                  : undefined
              }
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
