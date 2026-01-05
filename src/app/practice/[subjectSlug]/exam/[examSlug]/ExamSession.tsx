"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { LatexContent } from "@/components/ui/LatexContent";
import { createClient } from "@/lib/supabase/client";
import { Question, Profile, QuestionOption } from "@/types/database";
import {
  TrendingUp,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Send,
  LogOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { encodeId } from "@/lib/ids";
import { HandwriteCanvas } from "@/components/ui/HandwriteCanvas";

interface Exam {
  id: number;
  title: string;
  exam_type: string;
  duration_minutes: number;
}

interface ExamSessionProps {
  exam: Exam;
  questions: Question[];
  user: Profile;
  subjectId: number;
}

export default function ExamSession({
  exam,
  questions,
  user,
  subjectId,
}: ExamSessionProps) {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [initialTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFocusMode(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Prevent back navigation
  useEffect(() => {
    if (isFinished) return;
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isFinished]);

  // Prevent cheats
  useEffect(() => {
    if (isFinished) return;
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("paste", preventDefault);
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isFinished]);

  const toggleFocusMode = async () => {
    if (!isFocusMode) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        setIsFocusMode(true);
      }
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        setIsFocusMode(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: number, answer: string) => {
    if (isFinished) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const now = Date.now();
    const durationSeconds = Math.floor((now - initialTime) / 1000);
    setTimeTaken(durationSeconds);

    let correctCount = 0;
    let scoredQuestionsCount = 0;

    for (const q of questions) {
      if (q.type === "code_output") continue;
      scoredQuestionsCount++;
      if (answers[q.id] === q.answer) {
        correctCount++;
      }
    }

    setScore(correctCount);

    await supabase.from("exam_attempts").insert({
      user_id: user.id,
      exam_id: exam.id,
      started_at: new Date(initialTime).toISOString(),
      finished_at: new Date(now).toISOString(),
      score: correctCount,
      total_questions: scoredQuestionsCount,
      answers: answers,
    } as any);

    setIsFinished(true);
    setIsSubmitting(false);
  };

  const handleExit = () => {
    router.push("/library");
  };

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Results Screen
  if (isFinished) {
    const scoredQuestions = questions.filter((q) => q.type !== "code_output");
    const totalScored = scoredQuestions.length;
    const percentage =
      totalScored > 0 ? Math.round((score / totalScored) * 100) : 100;

    const wrongQuestionIds = questions
      .filter((q) => q.type !== "code_output" && answers[q.id] !== q.answer)
      .map((q) => q.id);

    const handleRedoMistakes = () => {
      sessionStorage.setItem(
        "redoQuestionIds",
        JSON.stringify(wrongQuestionIds)
      );
      router.push(`/practice/${encodeId(subjectId)}/setup?mode=redo`);
    };

    return (
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center justify-center">
          <GlassPanel className="p-8 max-w-2xl w-full text-center">
            <div className="inline-flex items-center justify-center size-20 rounded-full mb-6 bg-green-100 text-green-600">
              <CheckCircle2 className="size-10" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Exam Complete!</h1>
            <p className="text-[#4c669a] mb-6">{exam.title}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-sm text-[#4c669a] mb-1">Score</p>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-3xl font-bold text-[#135bec]">
                    {percentage}%
                  </span>
                  <span className="text-sm text-gray-500 mb-1">
                    ({score}/{totalScored})
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-sm text-[#4c669a] mb-1">Time Taken</p>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-3xl font-bold text-[#135bec]">
                    {formatTime(timeTaken)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleExit} className="flex-1">
                Back to Exams
              </Button>
              {wrongQuestionIds.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleRedoMistakes}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Redo Mistakes ({wrongQuestionIds.length})
                </Button>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    );
  }

  // Main UI - Exact PracticeSession Layout with All Questions
  return (
    <div
      className={`flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6`}
    >
      {/* Left Sidebar - Progress (Matching PracticeSession exactly) */}
      {!isFocusMode && (
        <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0 order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          {/* Timer Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Timer className="size-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Time Remaining
                </span>
              </div>
              {timeLeft < 300 && (
                <AlertTriangle className="size-4 text-red-500 animate-pulse" />
              )}
            </div>
            <div
              className={`text-2xl font-mono font-bold ${
                timeLeft < 300
                  ? "text-red-500"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Submit & Exit */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-3">
            <Button
              size="lg"
              onClick={submitExam}
              disabled={isSubmitting}
              className="w-full"
            >
              <Send className="size-5 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 group transform transition-all duration-200"
              onClick={handleExit}
            >
              <LogOut className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
              Exit
            </Button>
          </div>
        </aside>
      )}

      {/* Main Content - Paper Style with ALL Questions (Matching PracticeSession) */}
      <div
        className={`flex-1 flex flex-col gap-6 order-1 lg:order-2 ${
          isFocusMode
            ? "w-full max-w-5xl mx-auto transition-all duration-500"
            : ""
        }`}
      >
        <div className="bg-white dark:bg-slate-900 shadow-2xl min-h-[800px] p-12 lg:p-16 relative flex flex-col font-serif overflow-hidden">
          {/* Exam Header (Matching PracticeSession exactly) */}
          <div className="flex justify-between items-end border-b-2 border-black dark:border-white pb-4 mb-12 text-black dark:text-white font-serif">
            <div className="text-sm space-y-1">
              <p className="font-bold">
                Semester 1 Examinations, {new Date().getFullYear()}
              </p>
              <p className="italic">Part A - Multiple Choice Questions</p>
            </div>
            <div className="text-right text-sm space-y-1">
              <p className="font-bold uppercase">EXAM: {exam.title}</p>
              <p>{questions.length} Questions</p>
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-4 print:hidden">
            <div
              className={`flex items-center gap-4 transition-opacity duration-300 ${
                isFocusMode ? "opacity-30 hover:opacity-100" : "opacity-100"
              }`}
            >
              <button
                onClick={toggleFocusMode}
                className="p-2 rounded-full transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300"
                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {isFocusMode ? (
                  <Minimize2 className="size-5" />
                ) : (
                  <Maximize2 className="size-5" />
                )}
              </button>

              {isFocusMode && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-sans">
                  <Timer className="size-3.5" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          </div>

          {/* All Questions - Vertical List (Like the Screenshot) */}
          <div className="space-y-12">
            {questions.map((question, index) => {
              const options = question.options as unknown as
                | QuestionOption[]
                | null;
              const userAnswer = answers[question.id];

              return (
                <div key={question.id} className="mb-8">
                  {/* Question Text */}
                  <div className="flex gap-2 mb-6">
                    <span className="font-bold text-lg select-none">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <LatexContent className="font-serif text-black dark:text-gray-100 text-lg leading-relaxed">
                        {question.content}
                      </LatexContent>
                      {question.code_snippet && (
                        <div className="mt-4 max-w-full overflow-x-auto">
                          <CodeBlock code={question.code_snippet} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Area: Options OR Input */}
                  <div className="pl-6">
                    {options && Array.isArray(options) && options.length > 0 ? (
                      /* Multiple Choice Options - Exact PracticeSession Style */
                      <div className="space-y-4">
                        {options.map((option: any, optIndex: number) => {
                          const optionLabel =
                            String.fromCharCode(97 + optIndex) + ")"; // a), b), c)...
                          const isSelected = userAnswer === option.label;

                          return (
                            <div
                              key={option.label}
                              onClick={() =>
                                handleAnswer(question.id, option.label)
                              }
                              className={`group flex items-start gap-3 p-3 -ml-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              <span
                                className={`font-serif font-medium text-lg min-w-[32px] pt-0.5 ${
                                  isSelected
                                    ? "font-bold text-blue-600"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {optionLabel}
                              </span>
                              <div
                                className={`flex-1 font-serif text-lg leading-relaxed ${
                                  isSelected
                                    ? "text-blue-600 underline decoration-2 underline-offset-4"
                                    : "text-gray-900 dark:text-gray-100"
                                }`}
                              >
                                {option.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : question.type === "handwrite" ? (
                      /* Handwriting Canvas */
                      <div className="w-full h-[400px] border-2 border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-canvas-dark relative">
                        <HandwriteCanvas
                          strokeColor={isFocusMode ? "#000" : "#135bec"}
                          onStroke={() => {
                            if (!answers[question.id]) {
                              handleAnswer(question.id, "handwritten_content");
                            }
                          }}
                        />
                        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_23px,#000_24px)] bg-[size:100%_24px]" />
                      </div>
                    ) : question.type === "code_output" ? (
                      /* Code Output - Simple single-line input */
                      <div className="relative">
                        <input
                          type="text"
                          value={answers[question.id] || ""}
                          onChange={(e) =>
                            handleAnswer(question.id, e.target.value)
                          }
                          placeholder="Enter the expected output..."
                          className="w-full p-4 text-lg font-mono bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    ) : (
                      /* Default Text Input (Essay / Fill Blank) - PracticeSession Style */
                      <div className="relative">
                        <div className="absolute -left-6 top-8 bottom-8 w-0.5 bg-red-300/30 hidden lg:block" />
                        <textarea
                          value={answers[question.id] || ""}
                          onChange={(e) =>
                            handleAnswer(question.id, e.target.value)
                          }
                          placeholder=""
                          className="w-full min-h-[200px] p-0 bg-[repeating-linear-gradient(transparent,transparent_31px,#e5e7eb_32px)] text-lg leading-8 font-serif text-black dark:text-gray-100 border-none focus:ring-0 resize-y placeholder:text-gray-300 dark:placeholder:text-gray-700 bg-transparent translate-y-[6px]"
                          style={{
                            lineHeight: "32px",
                            backgroundAttachment: "local",
                            backgroundSize: "100% 32px",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* End of Paper */}
          <div className="mt-16 pt-8 border-t-2 border-black dark:border-white text-center font-serif text-sm text-gray-500">
            <p className="font-bold">END OF EXAMINATION</p>
          </div>
        </div>
      </div>
    </div>
  );
}
