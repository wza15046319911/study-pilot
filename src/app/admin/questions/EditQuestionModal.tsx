"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { X, Save, Tag, Plus, Trash2 } from "lucide-react";

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
}

interface EditQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
  onSave: (updated: Partial<Question>) => void;
}

export default function EditQuestionModal({
  isOpen,
  question,
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
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [options, setOptions] = useState<{ label: string; content: string }[]>(
    []
  );
  const [saving, setSaving] = useState(false);

  // Initialize form when question changes
  useEffect(() => {
    if (question) {
      setTitle(question.title || "");
      setContent(question.content || "");
      setAnswer(question.answer || "");
      setExplanation(question.explanation || "");
      setDifficulty(question.difficulty as "easy" | "medium" | "hard");
      setCodeSnippet(question.code_snippet || "");
      setTags(question.tags || []);
      setOptions(question.options || []);
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isChoiceType =
      question?.type === "single_choice" ||
      question?.type === "multiple_choice";

    const updated: Partial<Question> = {
      title,
      content,
      answer,
      explanation: explanation || null,
      difficulty,
      code_snippet: codeSnippet || null,
      tags: tags.length > 0 ? tags : null,
      options: isChoiceType ? options : null,
    };

    await onSave(updated);
    setSaving(false);
  };

  const addTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
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
              <div>
                <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
                  Edit Question #{question.id}
                </h2>
                <p className="text-sm text-[#4c669a] dark:text-gray-400">
                  Type: {question.type}
                </p>
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
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Question content..."
                      className="min-h-[150px]"
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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Code Snippet */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Code Snippet
                    </label>
                    <Textarea
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      placeholder="Code snippet (if any)..."
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-[#4c669a] dark:text-gray-400 mb-2">
                      Explanation
                    </label>
                    <Textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Explanation for the answer..."
                      className="min-h-[120px]"
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
                  </div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                <Save className="size-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
