"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { batchUploadQuestions } from "@/app/admin/questions/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LatexContent } from "@/components/ui/LatexContent";
import { X, Tag, Plus, FileUp, Loader2 } from "lucide-react";
import {
  TestCaseEditor,
  TestCasesConfig,
} from "@/components/admin/TestCaseEditor";
import { Database, Json } from "@/types/database";
// pdfjs-dist will be imported dynamically to avoid SSR issues with DOMMatrix

interface Subject {
  id: number;
  name: string;
}

interface Topic {
  id: number;
  name: string;
}

interface ParsedQuestion {
  title: string;
  content: string;
  options: { label: string; content: string }[];
  codeSnippet: string | null;
  answer: string;
  explanation: string;
  test_cases: TestCasesConfig | null;
  rawText: string;
}

type QuestionInsert = Database["public"]["Tables"]["questions"]["Insert"];
type QuestionType = QuestionInsert["type"];
type Difficulty = NonNullable<QuestionInsert["difficulty"]>;

const QUESTION_TYPE_VALUES: QuestionType[] = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "fill_blank",
  "code_output",
  "handwrite",
  "coding_challenge",
];

const DIFFICULTY_VALUES: Difficulty[] = ["easy", "medium", "hard"];

function isQuestionType(value: unknown): value is QuestionType {
  return (
    typeof value === "string" &&
    QUESTION_TYPE_VALUES.includes(value as QuestionType)
  );
}

function isDifficulty(value: unknown): value is Difficulty {
  return (
    typeof value === "string" && DIFFICULTY_VALUES.includes(value as Difficulty)
  );
}

function isValidCodingChallengeConfig(
  config: TestCasesConfig | null,
): config is TestCasesConfig {
  if (!config) return false;
  if (!config.function_name.trim()) return false;
  if (config.test_cases.length === 0) return false;
  return config.test_cases.every((testCase) => Array.isArray(testCase.input));
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
  "lambda function",
];

// Parse a single question block
function parseQuestionText(
  text: string,
  globalContext: string = "",
  type: QuestionType = "single_choice",
): ParsedQuestion {
  const lines = text.trim().split("\n");

  let title = "";
  let content = "";
  const options: { label: string; content: string }[] = [];
  let codeSnippet: string | null = null;
  const codeLines: string[] = [];

  let inCode = false;
  let inOptions = false;
  let currentOptionLabel = "";
  let currentOptionContent = "";

  const optionPattern = /^\s*\(?([a-eA-E])\)\s*(.*)$/;

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Only parse options if it's a choice question
    const isChoiceType = type === "single_choice" || type === "multiple_choice";
    const optMatch = isChoiceType ? trimmedLine.match(optionPattern) : null;

    if (optMatch) {
      if (currentOptionLabel) {
        options.push({
          label: currentOptionLabel.toUpperCase(),
          content: currentOptionContent.trim(),
        });
      }
      inOptions = true;
      inCode = false;
      currentOptionLabel = optMatch[1];
      currentOptionContent = optMatch[2];
    } else if (inOptions && currentOptionLabel) {
      currentOptionContent += " " + trimmedLine;
    } else if (!inOptions) {
      // Improved code detection: indented lines or common keywords
      const looksLikeCode =
        /^\s{2,}/.test(line) || // Indented (2+ spaces)
        /^(def |class |import |from |if |for |while |return |print\(|@)/.test(
          trimmedLine,
        ) ||
        /^[a-z_]+\s*=/.test(trimmedLine) ||
        // Check for double-char operators common in code (**, //, <<, >>)
        /(?:[\d\w\)]+\s*(?:\*\*|\/\/|<<|>>)\s*[\d\w\(]+)/.test(trimmedLine);

      if (looksLikeCode || inCode) {
        inCode = true;
        codeLines.push(line);
      } else if (!title) {
        title = trimmedLine;
        content = trimmedLine;
      } else {
        content += "\n" + trimmedLine;
      }
    }
  }

  if (currentOptionLabel) {
    options.push({
      label: currentOptionLabel.toUpperCase(),
      content: currentOptionContent.trim(),
    });
  }

  // Handle local code snippet
  if (codeLines.length > 0) {
    const localCode = codeLines.join("\n");
    // If we have global context, append local code to it
    codeSnippet = globalContext
      ? `${globalContext}\n\n${localCode}`
      : localCode;
  } else if (globalContext) {
    codeSnippet = globalContext;
  }

  // Clean metadata patterns: (2017s2 Q34) and question numbers like "184."
  const yearTagPattern = /\s*\(?\d{4}s\d+\s*Q?\d*\)?\s*/gi;
  const questionNumberPattern = /^\s*\d+[-.]?\s*/;

  // Clean from content
  content = content.replace(yearTagPattern, " ").trim();
  content = content.replace(questionNumberPattern, "").trim();

  // Clean from title
  title = title.replace(yearTagPattern, " ").trim();
  title = title.replace(questionNumberPattern, "").trim();

  // Generate clean title from content if title is now empty or too short
  if (title.length < 5 && content.length > 0) {
    title = content.substring(0, 50) + (content.length > 50 ? "..." : "");
  } else if (title.length > 50) {
    title = title.substring(0, 50) + "...";
  }

  // Default answer
  let answer = "";
  if (type === "code_output") {
    answer = "N/A";
  } else if (type === "coding_challenge") {
    answer = "all_tests_passed";
  }

  return {
    title,
    content,
    options,
    codeSnippet,
    answer,
    explanation: "",
    test_cases:
      type === "coding_challenge"
        ? { function_name: "solution", test_cases: [] }
        : null,
    rawText: text,
  };
}

// Split text into multiple question blocks, preserving preamble as context
function splitIntoQuestions(text: string): {
  questions: string[];
  context: string;
} {
  // Pattern to detect new question start
  const questionStartPattern =
    /^(\s*\(?\d{4}s\d+\s*Q?\d*\)?\s*\d+\.|\s*\d+\.)\s/m;

  const lines = text.split("\n");
  const questions: string[] = [];
  let currentQuestion: string[] = [];
  let preambleLines: string[] = [];
  let foundFirstQuestion = false;

  for (const line of lines) {
    // Check if this line starts a new question
    if (questionStartPattern.test(line)) {
      if (!foundFirstQuestion) {
        // Everything before the first question is Preamble/Context
        preambleLines = currentQuestion;
        foundFirstQuestion = true;
        currentQuestion = [];
      } else if (currentQuestion.length > 0) {
        // Finish previous question
        // Check if it has options (sanity check to avoid splitting code lines that look like numbers?)
        // Actually, let's trust the strict regex (must have dot and space)
        questions.push(currentQuestion.join("\n"));
        currentQuestion = [];
      }
    }
    currentQuestion.push(line);
  }

  // Last question
  if (currentQuestion.length > 0) {
    if (!foundFirstQuestion) {
      // No questions found at all? Treat everything as one question?
      // Or maybe the pattern failed. Let's return as one question for safety if it has options.
      questions.push(currentQuestion.join("\n"));
    } else {
      questions.push(currentQuestion.join("\n"));
    }
  }

  const context = preambleLines.join("\n").trim();
  return {
    questions: questions.filter((q) => q.trim().length > 0),
    context,
  };
}

export default function UploadQuestionPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [questionType, setQuestionType] =
    useState<QuestionType>("single_choice");
  const [questionText, setQuestionText] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | null>(
    null,
  );

  const supabase = createClient();
  const DRAFT_KEY = "upload-questions-draft";

  // Restore draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.questionText) setQuestionText(draft.questionText);
        if (draft.selectedSubject) setSelectedSubject(draft.selectedSubject);
        if (draft.selectedTopic) setSelectedTopic(draft.selectedTopic);
        if (isQuestionType(draft.questionType))
          setQuestionType(draft.questionType);
        if (isDifficulty(draft.difficulty)) setDifficulty(draft.difficulty);
        if (draft.tags) setTags(draft.tags);
        setDraftStatus("saved");
        setTimeout(() => setDraftStatus(null), 2000);
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, []);

  // Auto-save draft (debounced)
  useEffect(() => {
    if (!questionText && !selectedSubject && tags.length === 0) return;

    setDraftStatus("saving");
    const timer = setTimeout(() => {
      const draft = {
        questionText,
        selectedSubject,
        selectedTopic,
        questionType,
        difficulty,
        tags,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftStatus("saved");
      setTimeout(() => setDraftStatus(null), 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    questionText,
    selectedSubject,
    selectedTopic,
    questionType,
    difficulty,
    tags,
  ]);

  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase.from("subjects").select("id, name");
      if (data) setSubjects(data);
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    async function fetchTopics() {
      if (!selectedSubject) {
        setTopics([]);
        return;
      }
      const { data } = await supabase
        .from("topics")
        .select("id, name, subject_id")
        .eq("subject_id", parseInt(selectedSubject));
      if (data) setTopics(data);
    }
    fetchTopics();
  }, [selectedSubject]);

  // Parse questions when text changes
  useEffect(() => {
    if (questionText.trim()) {
      const { questions, context } = splitIntoQuestions(questionText);
      const parsed = questions.map((block) =>
        parseQuestionText(block, context, questionType),
      );
      setParsedQuestions(parsed);
    } else {
      setParsedQuestions([]);
    }
  }, [questionText, questionType]);

  // Update answer for a specific question
  function updateAnswer(index: number, answer: string) {
    setParsedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], answer: answer }; // Free text answer
      return updated;
    });
  }

  function updateCodeSnippet(index: number, snippet: string) {
    setParsedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], codeSnippet: snippet };
      return updated;
    });
  }

  function updateExplanation(index: number, explanation: string) {
    setParsedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], explanation: explanation };
      return updated;
    });
  }

  function updateTestCases(index: number, config: TestCasesConfig) {
    setParsedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], test_cases: config };
      return updated;
    });
  }

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

  // PDF Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      setMessage({ type: "error", text: "Please select a valid PDF file." });
      return;
    }

    setPdfLoading(true);
    setPdfFileName(file.name);
    setMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => {
            if (
              typeof item === "object" &&
              item !== null &&
              "str" in item &&
              typeof (item as { str: unknown }).str === "string"
            ) {
              return (item as { str: string }).str;
            }
            return "";
          })
          .join(" ");
        fullText += pageText + "\n\n";
      }

      // Clean up the extracted text
      const cleanedText = fullText
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/([.?!])\s+/g, "$1\n") // Add line breaks after sentences
        .replace(/(\d+[.)]) /g, "\n$1 ") // Add line breaks before numbered items
        .replace(/\([A-Ea-e]\) /gi, "\n$& ") // Add line breaks before options
        .trim();

      setQuestionText(cleanedText);
      setMessage({
        type: "success",
        text: `Extracted text from ${pdf.numPages} page(s). Review and edit as needed.`,
      });
    } catch (error) {
      console.error("PDF extraction error:", error);
      setMessage({
        type: "error",
        text: "Failed to extract text from PDF. The file may be corrupted or image-based.",
      });
      setPdfFileName(null);
    } finally {
      setPdfLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedSubject) {
      setMessage({ type: "error", text: "Please select a subject." });
      return;
    }

    const isChoiceType =
      questionType === "single_choice" || questionType === "multiple_choice";
    const isCodingChallenge = questionType === "coding_challenge";

    const hasInvalidCodingChallenge = isCodingChallenge
      ? parsedQuestions.some(
          (q) => q.content && !isValidCodingChallengeConfig(q.test_cases),
        )
      : false;

    if (hasInvalidCodingChallenge) {
      setMessage({
        type: "error",
        text: "Every coding challenge must include a function name and at least one valid test case.",
      });
      return;
    }

    const validQuestions = parsedQuestions.filter(
      (q) =>
        (isChoiceType ? q.options.length > 0 : true) &&
        q.content &&
        (!isCodingChallenge || isValidCodingChallengeConfig(q.test_cases)),
    );

    if (validQuestions.length === 0) {
      setMessage({
        type: "error",
        text: "No valid questions to upload. Check missing content or options.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    const questionsData = validQuestions.map((q) => ({
      subject_id: parseInt(selectedSubject),
      topic_id: selectedTopic ? parseInt(selectedTopic) : null,
      title: q.title.substring(0, 100),
      content: q.content,
      type: questionType,
      difficulty,
      options: isChoiceType ? q.options : null,
      answer: isCodingChallenge ? "all_tests_passed" : q.answer,
      explanation: q.explanation || null,
      code_snippet: q.codeSnippet,
      test_cases: isCodingChallenge ? q.test_cases : null,
      tags: tags.length > 0 ? tags : null,
    }));

    const result = await batchUploadQuestions(questionsData);

    setLoading(false);

    if (!result.success) {
      setMessage({ type: "error", text: `Error: ${result.error}` });
    } else {
      setMessage({
        type: "success",
        text: `Successfully uploaded ${result.count} question(s)!`,
      });
      setQuestionText("");
      setParsedQuestions([]);
      localStorage.removeItem(DRAFT_KEY); // Clear draft on success
    }
  }

  const isChoiceType =
    questionType === "single_choice" || questionType === "multiple_choice";
  const isCodingChallenge = questionType === "coding_challenge";
  const validCount = parsedQuestions.filter(
    (q) =>
      (isChoiceType ? q.options.length > 0 : true) &&
      q.content &&
      (!isCodingChallenge || isValidCodingChallengeConfig(q.test_cases)),
  ).length;
  const totalCount = parsedQuestions.length;
  const hasGlobalContext =
    parsedQuestions.length > 0 &&
    parsedQuestions[0].codeSnippet &&
    parsedQuestions[0].codeSnippet.length > 100;

  return (
    <div>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
            Upload Questions
          </h1>
          {draftStatus && (
            <span
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                draftStatus === "saving"
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {draftStatus === "saving" ? "Auto-saving..." : "Draft restored"}
            </span>
          )}
        </div>
        <p className="text-[#4c669a] mb-8">
          Paste one or multiple questions. Text before the first question is{" "}
          <strong>Shared Context</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassPanel className="p-6">
            <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4">
              Subject & Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                options={[
                  { value: "", label: "Select subject" },
                  ...subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  })),
                ]}
                  placeholder="Select Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c669a] mb-2">
                  Topic (Optional)
                </label>
                <Select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  options={[
                  { value: "", label: "Select topic (optional)" },
                  ...topics.map((t) => ({ value: t.id, label: t.name })),
                ]}
                  placeholder="Select Topic"
                  disabled={!selectedSubject}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c669a] mb-2">
                  Type
                </label>
                <Select
                  value={questionType}
                  onChange={(e) => {
                    if (isQuestionType(e.target.value)) {
                      setQuestionType(e.target.value);
                    }
                  }}
                  options={[
                    { value: "single_choice", label: "Single Choice (MCQ)" },
                    { value: "multiple_choice", label: "Multiple Choice" },
                    { value: "true_false", label: "True / False" },
                    { value: "fill_blank", label: "Fill in the Blank" },
                    {
                      value: "code_output",
                      label: "Code Output / Short Answer",
                    },
                    {
                      value: "coding_challenge",
                      label: "Coding Challenge (Run Code)",
                    },
                  ]}
                />
                {questionType === "coding_challenge" && (
                  <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    Coding Challenge enabled. Configure function name and test
                    cases in each parsed question card.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4c669a] mb-2">
                  Difficulty
                </label>
                <Select
                  value={difficulty}
                  onChange={(e) => {
                    if (isDifficulty(e.target.value)) {
                      setDifficulty(e.target.value);
                    }
                  }}
                  options={[
                    { value: "easy", label: "Easy" },
                    { value: "medium", label: "Medium" },
                    { value: "hard", label: "Hard" },
                  ]}
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-[#4c669a] mb-2">
                  <Tag className="size-4 inline mr-1" />
                  Tags (Batch)
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs"
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
                    placeholder="Add tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addTag}
                    className="h-9 px-3"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-[#4c669a] mb-2">Preset tags</p>
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
          </GlassPanel>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left: Question Input (Takes 4 cols) */}
            <div className="xl:col-span-4">
              <GlassPanel className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white">
                    Paste Content
                  </h2>

                  {/* PDF Upload Button */}
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="sr-only"
                      disabled={pdfLoading}
                    />
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed transition-colors ${
                        pdfLoading
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      {pdfLoading ? (
                        <Loader2 className="size-4 animate-spin text-blue-500" />
                      ) : (
                        <FileUp className="size-4 text-gray-500" />
                      )}
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {pdfLoading
                          ? "Extracting..."
                          : pdfFileName || "Upload PDF"}
                      </span>
                    </div>
                  </label>
                </div>

                {pdfFileName && !pdfLoading && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <span>📄 {pdfFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFileName(null);
                        setQuestionText("");
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}

                <Textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={
                    questionType.includes("choice")
                      ? `Paste questions with options...\n1. Question?\n(a) Yes\n(b) No`
                      : questionType === "true_false"
                        ? `Paste questions...\n1. Is the sky blue?`
                        : `Paste questions (no options needed)...\n1. What is 2+2?`
                  }
                  className="min-h-[600px] h-[calc(100vh-400px)] font-mono text-xs"
                />
              </GlassPanel>
            </div>

            {/* Right: Preview (Takes 8 cols) */}
            <div className="xl:col-span-8 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              <div className="sticky top-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-2 z-10 shadow-sm mb-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-medium text-[#4c669a]">
                    Preview ({validCount}/{totalCount} ready)
                  </span>
                </div>
              </div>

              {parsedQuestions.length > 0 ? (
                parsedQuestions.map((q, idx) => (
                  <GlassPanel
                    key={idx}
                    className={`p-4 border-l-4 ${
                      (isChoiceType ? q.options.length > 0 : true) &&
                      q.content &&
                      (!isCodingChallenge ||
                        isValidCodingChallengeConfig(q.test_cases))
                        ? "border-green-500"
                        : "border-orange-500"
                    } overflow-hidden`}
                  >
                    <div className="flex items-start justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-sm font-bold text-[#4c669a] pt-1">
                        Question {idx + 1}
                      </span>
                      <div className="flex flex-col items-end gap-2 flex-grow justify-end min-w-[300px]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#4c669a]">
                            Answer:
                          </span>
                        </div>

                        {isChoiceType ? (
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) =>
                              updateAnswer(idx, e.target.value.toUpperCase())
                            }
                            placeholder="A"
                            maxLength={1}
                            className="w-12 h-8 text-center uppercase bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded text-sm font-bold"
                          />
                        ) : questionType === "true_false" ? (
                          <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                            {["True", "False"].map((opt) => (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => updateAnswer(idx, opt)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  q.answer === opt
                                    ? opt === "True"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : questionType === "coding_challenge" ? (
                          <input
                            type="text"
                            value="all_tests_passed"
                            disabled
                            className="w-full h-8 px-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-gray-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => updateAnswer(idx, e.target.value)}
                            placeholder="Expected Answer"
                            className="w-full h-8 px-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded text-xs"
                          />
                        )}
                      </div>
                    </div>

                    {/* Side-by-Side Layout for Code + Content */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Left Column: Code/Context - NOW EDITABLE */}
                      <div className="max-h-[400px] flex flex-col gap-2">
                        <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                          Context / Code
                        </div>
                        <Textarea
                          value={q.codeSnippet || ""}
                          onChange={(e) =>
                            updateCodeSnippet(idx, e.target.value)
                          }
                          placeholder="Edit code snippet..."
                          className="min-h-[200px] font-mono text-sm"
                        />
                      </div>

                      {/* Right Column: Question + Options */}
                      <div className="flex flex-col justify-center">
                        <div className="text-sm text-[#0d121b] dark:text-white mb-4 font-medium leading-relaxed">
                          {q.content ? (
                            <LatexContent className="whitespace-pre-wrap">
                              {q.content}
                            </LatexContent>
                          ) : (
                            <span className="text-red-400 italic">
                              No content detected
                            </span>
                          )}
                        </div>

                        {isChoiceType && (
                          <div className="space-y-2">
                            {q.options.length > 0 ? (
                              q.options.map((opt, i) => (
                                <div
                                  key={i}
                                  className={`text-sm p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                                    opt.label === q.answer
                                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                      : "bg-white/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10"
                                  }`}
                                >
                                  <span
                                    className={`font-bold min-w-[20px] ${
                                      opt.label === q.answer
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-[#4c669a]"
                                    }`}
                                  >
                                    {opt.label}.
                                  </span>
                                  <span className="text-[#0d121b] dark:text-gray-200">
                                    <LatexContent className="whitespace-pre-wrap">
                                      {opt.content}
                                    </LatexContent>
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-red-400 italic">
                                No options detected
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Explanation / Solution
                      </label>
                      <Textarea
                        value={q.explanation || ""}
                        onChange={(e) => updateExplanation(idx, e.target.value)}
                        placeholder="Explain the answer..."
                        className="min-h-[80px] text-sm bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-slate-800"
                      />
                    </div>

                    {questionType === "coding_challenge" && q.test_cases && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <TestCaseEditor
                          value={q.test_cases}
                          onChange={(config) => updateTestCases(idx, config)}
                        />
                      </div>
                    )}
                  </GlassPanel>
                ))
              ) : (
                <GlassPanel className="p-6">
                  <div className="text-[#4c669a] italic text-center py-12">
                    Paste questions on the left to see preview
                  </div>
                </GlassPanel>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-between items-center bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm sticky bottom-0 z-20">
            <span className="text-sm font-medium text-[#4c669a]">
              {validCount} valid / {totalCount} total
            </span>
            <Button
              type="submit"
              disabled={loading || validCount === 0}
              size="lg"
              className="shadow-xl"
            >
              {loading ? "Uploading..." : `Upload ${validCount} Question(s)`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
