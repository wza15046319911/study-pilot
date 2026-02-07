"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { replacePastExamQuestions, upsertPastExam } from "../actions";

interface Subject {
  id: number;
  name: string;
}

interface PastExamBuilderProps {
  subjects: Subject[];
  initialData?: any;
}

interface DraftQuestion {
  clientId: string;
  question_type: string;
  content: string;
  answer: string;
  explanation: string;
}

const questionTypeOptions = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "fill_blank", label: "Fill in Blank" },
  { value: "code_output", label: "Code Output" },
  { value: "true_false", label: "True / False" },
  { value: "handwrite", label: "Handwrite" },
  { value: "short_answer", label: "Short Answer" },
];

const createDraftQuestion = (seed?: Partial<DraftQuestion> & { id?: number }) => ({
  clientId: seed?.id ? `q-${seed.id}` : crypto.randomUUID(),
  question_type: seed?.question_type || "single_choice",
  content: seed?.content || "",
  answer: seed?.answer || "",
  explanation: seed?.explanation || "",
});

export default function PastExamBuilder({
  subjects,
  initialData,
}: PastExamBuilderProps) {
  const router = useRouter();

  const [subjectId, setSubjectId] = useState(
    initialData?.subject_id?.toString() || ""
  );
  const [year, setYear] = useState(initialData?.year?.toString() || "");
  const [semester, setSemester] = useState(
    initialData?.semester?.toString() || "1"
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [isPublished, setIsPublished] = useState(
    initialData?.is_published || false
  );
  const [questions, setQuestions] = useState<DraftQuestion[]>(() => {
    if (initialData?.questions?.length) {
      return initialData.questions.map((question: any) =>
        createDraftQuestion(question)
      );
    }
    return [createDraftQuestion()];
  });
  const [saving, setSaving] = useState(false);

  const subjectOptions = useMemo(
    () => [
      { value: "", label: "Select subject" },
      ...subjects.map((subject) => ({
        value: subject.id,
        label: subject.name,
      })),
    ],
    [subjects]
  );

  const semesterOptions = [
    { value: "1", label: "Semester 1" },
    { value: "2", label: "Semester 2" },
  ];

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createDraftQuestion()]);
  };

  const removeQuestion = (clientId: string) => {
    setQuestions((prev) => prev.filter((q) => q.clientId !== clientId));
  };

  const moveQuestion = (clientId: string, direction: "up" | "down") => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q.clientId === clientId);
      if (index === -1) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(nextIndex, 0, moved);
      return updated;
    });
  };

  const updateQuestion = (clientId: string, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.clientId === clientId ? { ...q, ...patch } : q))
    );
  };

  const handleSave = async (publish: boolean) => {
    const parsedYear = parseInt(year, 10);
    const parsedSemester = parseInt(semester, 10);

    if (!subjectId || !parsedYear || year.length !== 4) {
      alert("Please select a subject and enter a valid 4-digit year.");
      return;
    }

    if (![1, 2].includes(parsedSemester)) {
      alert("Please select a valid semester.");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    const hasEmptyAnswer = questions.some((q) => !q.answer.trim());
    if (hasEmptyAnswer) {
      alert("Each question must include an answer.");
      return;
    }

    setSaving(true);
    try {
      const { pastExamId } = await upsertPastExam({
        pastExamId: initialData?.id,
        subjectId: parseInt(subjectId, 10),
        year: parsedYear,
        semester: parsedSemester,
        title: title.trim() || null,
        isPublished: publish,
      });

      await replacePastExamQuestions({
        pastExamId,
        questions: questions.map((question) => ({
          question_type: question.question_type,
          content: question.content.trim() || null,
          answer: question.answer.trim(),
          explanation: question.explanation.trim() || null,
        })),
      });

      router.push("/admin/past-exams");
    } catch (error) {
      alert(
        `Failed to ${initialData ? "update" : "create"} past exam: ` +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setSaving(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/past-exams">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="size-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {initialData ? "Edit Past Exam" : "Create Past Exam"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Capture answer keys by subject, year, semester, and paper.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Past Exam Details
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
                  options={subjectOptions}
                  placeholder="Select subject"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Year
                </label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-2"
                  placeholder="2023"
                  min={2000}
                  max={2100}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Semester
                </label>
                <Select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="mt-2"
                  options={semesterOptions}
                  placeholder="Select semester"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Title (optional)
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                  placeholder="2023 Semester 1 Answer Key"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Tip: set a distinct title when the same semester has multiple
                  papers.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Published
                  </p>
                  <p className="text-xs text-slate-500">
                    Controls visibility in the library
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Save Changes
            </h3>
            <div className="space-y-3">
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setIsPublished(false);
                  handleSave(false);
                }}
                disabled={saving}
              >
                Save Draft
              </Button>
              <Button
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => {
                  setIsPublished(true);
                  handleSave(true);
                }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Publish"}
              </Button>
            </div>
          </GlassPanel>
        </div>

        <div className="xl:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Answer Key
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add every question and its reference answer.
              </p>
            </div>
            <Button onClick={addQuestion} className="gap-2">
              <Plus className="size-4" /> Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <GlassPanel key={question.clientId} className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-rose-500 font-semibold">
                      Question {index + 1}
                    </div>
                    <p className="text-sm text-slate-500">
                      Define the type, answer, and optional explanation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => moveQuestion(question.clientId, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => moveQuestion(question.clientId, "down")}
                      disabled={index === questions.length - 1}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => removeQuestion(question.clientId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Question Type
                      </label>
                      <Select
                        value={question.question_type}
                        onChange={(e) =>
                          updateQuestion(question.clientId, {
                            question_type: e.target.value,
                          })
                        }
                        className="mt-2"
                        options={questionTypeOptions}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Answer
                      </label>
                      <Textarea
                        value={question.answer}
                        onChange={(e) =>
                          updateQuestion(question.clientId, {
                            answer: e.target.value,
                          })
                        }
                        className="mt-2 min-h-[140px]"
                        placeholder="Provide the reference answer..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Question Content (optional)
                      </label>
                      <Textarea
                        value={question.content}
                        onChange={(e) =>
                          updateQuestion(question.clientId, {
                            content: e.target.value,
                          })
                        }
                        className="mt-2 min-h-[140px]"
                        placeholder="Enter the question prompt or details..."
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Explanation (optional)
                      </label>
                      <Textarea
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(question.clientId, {
                            explanation: e.target.value,
                          })
                        }
                        className="mt-2 min-h-[140px]"
                        placeholder="Add a short explanation..."
                      />
                    </div>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
