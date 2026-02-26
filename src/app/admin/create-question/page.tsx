"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import {
  TestCaseEditor,
  TestCasesConfig,
} from "@/components/admin/TestCaseEditor";
import { Plus, Trash2, Tag, Save, Sparkles } from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
  subject_id: number;
}

interface QuestionOptionInput {
  label: string;
  content: string;
}

const defaultOptions: QuestionOptionInput[] = [
  { label: "A", content: "" },
  { label: "B", content: "" },
  { label: "C", content: "" },
  { label: "D", content: "" },
];

const questionTypeOptions = [
  { value: "single_choice", label: "Single Choice (MCQ)" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True / False" },
  { value: "fill_blank", label: "Fill in the Blank" },
  { value: "code_output", label: "Code Output / Short Answer" },
  { value: "coding_challenge", label: "Coding Challenge" },
];

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function CreateQuestionPage() {
  const supabase = createClient();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questionType, setQuestionType] = useState("single_choice");
  const [difficulty, setDifficulty] = useState("medium");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [options, setOptions] = useState<QuestionOptionInput[]>(defaultOptions);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [testCases, setTestCases] = useState<TestCasesConfig>({
    function_name: "solution",
    test_cases: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isChoiceType =
    questionType === "single_choice" || questionType === "multiple_choice";
  const isCodingChallenge = questionType === "coding_challenge";
  const isCodeRelated =
    questionType === "code_output" || questionType === "coding_challenge";

  const availableAnswerOptions = useMemo(
    () => options.filter((opt) => opt.content.trim()),
    [options],
  );

  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase.from("subjects").select("id, name");
      if (data) setSubjects(data);
    }
    fetchSubjects();
  }, [supabase]);

  useEffect(() => {
    async function fetchTopics() {
      if (!selectedSubject) {
        setTopics([]);
        return;
      }
      const { data } = await supabase
        .from("topics")
        .select("id, name, subject_id")
        .eq("subject_id", parseInt(selectedSubject, 10));

      if (data) setTopics(data);
    }
    fetchTopics();
  }, [selectedSubject, supabase]);

  useEffect(() => {
    setMessage(null);

    if (isChoiceType && options.length === 0) {
      setOptions(defaultOptions);
    }

    if (!isChoiceType) {
      setOptions(defaultOptions);
    }

    if (isCodingChallenge) {
      setAnswer("all_tests_passed");
      if (!codeSnippet.trim()) {
        setCodeSnippet("def solution(*args):\n    # Write your code here\n    pass");
      }
    }
  }, [questionType, isChoiceType, isCodingChallenge, options.length, codeSnippet]);

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], content: value };
      return next;
    });
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        label: String.fromCharCode(65 + prev.length),
        content: "",
      },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((item, i) => ({
        ...item,
        label: String.fromCharCode(65 + i),
      }));
    });
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags((prev) => [...prev, tag]);
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const resetForm = () => {
    setSelectedTopic("");
    setQuestionType("single_choice");
    setDifficulty("medium");
    setTitle("");
    setContent("");
    setAnswer("");
    setExplanation("");
    setCodeSnippet("");
    setOptions(defaultOptions);
    setTags([]);
    setNewTag("");
    setTestCases({ function_name: "solution", test_cases: [] });
  };

  const validateForm = () => {
    if (!selectedSubject) return "Please select a subject.";
    if (!content.trim()) return "Question content is required.";

    if (isChoiceType) {
      const validOptions = options.filter((opt) => opt.content.trim());
      if (validOptions.length < 2) {
        return "At least 2 options are required for choice questions.";
      }

      if (questionType === "single_choice") {
        if (!answer.trim()) return "Please select the correct answer option.";
        const answerExists = validOptions.some((opt) => opt.label === answer);
        if (!answerExists) return "Selected answer must match an option label.";
      } else {
        if (!answer.trim()) {
          return "For multiple choice, set answer labels (e.g., A,C).";
        }
      }
    } else if (questionType === "true_false") {
      if (!answer.trim()) return "Please choose True or False.";
    } else if (!isCodingChallenge && !answer.trim()) {
      return "Answer is required for this question type.";
    }

    if (isCodingChallenge) {
      if (!testCases.function_name.trim()) return "Function name is required.";
      if (testCases.test_cases.length === 0) {
        return "Add at least one test case for coding challenge.";
      }
    }

    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setLoading(true);
    setMessage(null);

    const finalTitle =
      title.trim() || content.trim().slice(0, 80) || "Untitled Question";
    const payload = {
      subject_id: parseInt(selectedSubject, 10),
      topic_id: selectedTopic ? parseInt(selectedTopic, 10) : null,
      title: finalTitle,
      content: content.trim(),
      type: questionType,
      difficulty: difficulty as "easy" | "medium" | "hard",
      options: isChoiceType
        ? options
            .filter((opt) => opt.content.trim())
            .map((opt) => ({ label: opt.label, content: opt.content.trim() }))
        : null,
      answer: isCodingChallenge ? "all_tests_passed" : answer.trim(),
      explanation: explanation.trim() || null,
      code_snippet: isCodeRelated ? codeSnippet.trim() || null : null,
      test_cases: isCodingChallenge ? testCases : null,
      tags: tags.length > 0 ? tags : null,
    };

    const { error } = await supabase.from("questions").insert(payload as any);
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: `Failed to create question: ${error.message}` });
      return;
    }

    setMessage({ type: "success", text: "Question created successfully." });
    resetForm();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-2">
          Create Question
        </h1>
        <p className="text-[#4c669a]">
          Build one question from scratch. No paste parsing, manual input only.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        <GlassPanel className="p-6">
          <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4">
            Basic Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#4c669a] mb-2">
                Subject *
              </label>
              <Select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic("");
                }}
                options={subjects.map((subject) => ({
                  value: subject.id,
                  label: subject.name,
                }))}
                placeholder="Select subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4c669a] mb-2">
                Topic (Optional)
              </label>
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                options={topics.map((topic) => ({
                  value: topic.id,
                  label: topic.name,
                }))}
                placeholder="Select topic"
                disabled={!selectedSubject}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4c669a] mb-2">
                Question Type
              </label>
              <Select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                options={questionTypeOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4c669a] mb-2">
                Difficulty
              </label>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={difficultyOptions}
              />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white">
            Question Content
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Title (Optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to auto-generate from content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Content *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full question content..."
              className="min-h-[160px]"
            />
          </div>

          {isCodeRelated && (
            <div>
              <label className="block text-sm font-medium text-[#4c669a] mb-2">
                Starter Code / Code Snippet
              </label>
              <Textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Optional code snippet shown to students..."
                className="min-h-[180px] font-mono"
              />
            </div>
          )}

          {isChoiceType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#4c669a]">
                  Options *
                </label>
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

              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.label} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 text-[#4c669a] font-semibold flex items-center justify-center">
                      {option.label}
                    </div>
                    <Input
                      value={option.content}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${option.label} content`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Answer *
            </label>

            {questionType === "single_choice" ? (
              <Select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                options={availableAnswerOptions.map((option) => ({
                  value: option.label,
                  label: `${option.label} — ${option.content.slice(0, 60)}`,
                }))}
                placeholder="Select the correct option"
              />
            ) : questionType === "true_false" ? (
              <Select
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                options={[
                  { value: "true", label: "True" },
                  { value: "false", label: "False" },
                ]}
                placeholder="Select True or False"
              />
            ) : isCodingChallenge ? (
              <Input value="all_tests_passed" disabled />
            ) : (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={
                  questionType === "multiple_choice"
                    ? "e.g. A,C"
                    : "Expected answer"
                }
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4c669a] mb-2">
              Explanation (Optional)
            </label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this answer is correct..."
              className="min-h-[130px]"
            />
          </div>
        </GlassPanel>

        {isCodingChallenge && (
          <GlassPanel className="p-6">
            <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4">
              Coding Challenge Test Cases
            </h2>
            <TestCaseEditor value={testCases} onChange={setTestCases} />
          </GlassPanel>
        )}

        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white">
            Tags
          </h2>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              >
                <Tag className="size-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addTag}>
              Add
            </Button>
          </div>
        </GlassPanel>

        {message && (
          <div
            className={`rounded-xl p-4 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Reset
          </Button>
          <Button type="submit" isLoading={loading}>
            <Save className="size-4 mr-2" />
            Create Question
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#4c669a] dark:text-gray-400">
          <Sparkles className="size-3.5" />
          Built for manual creation from blank form.
        </div>
      </form>
    </div>
  );
}
