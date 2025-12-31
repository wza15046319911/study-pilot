"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { LatexContent } from "@/components/ui/LatexContent";
import { createClient } from "@/lib/supabase/client";
import { Question, Profile, QuestionOption } from "@/types/database";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
  LogOut,
} from "lucide-react";
import { encodeId } from "@/lib/ids";

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

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration_minutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

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

  // Prevent copy/paste/context menu
  useEffect(() => {
    if (isFinished) return;

    const preventDefault = (e: Event) => e.preventDefault();

    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("paste", preventDefault);
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("selectstart", preventDefault);

    return () => {
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("selectstart", preventDefault);
    };
  }, [isFinished]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const [startTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);

  // ...

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const now = Date.now();
    const durationSeconds = Math.floor((now - startTime) / 1000);
    setTimeTaken(durationSeconds);

    // Calculate score (excluding code_output)
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

    // Save attempt
    await supabase.from("exam_attempts").insert({
      user_id: user.id,
      exam_id: exam.id,
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date(now).toISOString(),
      score: correctCount,
      total_questions: scoredQuestionsCount,
      answers: answers,
    } as any);

    setIsFinished(true);
    setIsSubmitting(false);
  };

  const handleExit = () => {
    router.push(`/practice/${encodeId(subjectId)}/exams`);
  };

  // Results screen
  if (isFinished) {
    // Only count non-code questions for percentage
    const scoredQuestions = questions.filter((q) => q.type !== "code_output");
    const totalScored = scoredQuestions.length;
    const percentage =
      totalScored > 0 ? Math.round((score / totalScored) * 100) : 100;

    // Calculate wrong question IDs for redo
    const wrongQuestionIds = questions
      .filter((q) => q.type !== "code_output" && answers[q.id] !== q.answer)
      .map((q) => q.id);

    const handleRedoMistakes = () => {
      // Store wrong question IDs in sessionStorage and navigate
      sessionStorage.setItem(
        "redoQuestionIds",
        JSON.stringify(wrongQuestionIds)
      );
      router.push(`/practice/${encodeId(subjectId)}/setup?mode=redo`);
    };

    return (
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        {/* Summary Card */}
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

        {/* Detailed Review - Batched Display */}
        <div className="flex-1 flex flex-col gap-6 pb-20">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold">Review Answers</h2>
            <span className="text-sm text-gray-500">
              Showing {Math.min(visibleCount, questions.length)} of{" "}
              {questions.length}
            </span>
          </div>

          {questions.slice(0, visibleCount).map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.answer;
            const isCode = question.type === "code_output";
            const options = question.options as unknown as
              | QuestionOption[]
              | null;

            return (
              <GlassPanel
                key={question.id}
                className={`p-6 border-l-4 ${
                  isCode
                    ? "border-gray-300"
                    : isCorrect
                    ? "border-green-500"
                    : "border-red-500"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-bold text-[#4c669a] bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full mr-2">
                      Q{index + 1}
                    </span>
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {question.type.replace("_", " ")}
                    </span>
                  </div>
                  {!isCode && (
                    <span
                      className={`text-sm font-bold ${
                        isCorrect ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  )}
                  {isCode && (
                    <span className="text-sm font-bold text-gray-500">
                      Not Graded
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold mb-2">{question.title}</h3>
                <div className="mb-4 text-[#4c669a]">{question.content}</div>

                {isCode ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Your Output:</p>
                      <code className="block whitespace-pre-wrap text-sm">
                        {userAnswer || "(No answer)"}
                      </code>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-300">
                        Expected Output:
                      </p>
                      <code className="block whitespace-pre-wrap text-sm">
                        {question.answer}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">Your Answer:</p>
                      <p className="font-medium">
                        {options
                          ? options.find((o) => o.label === userAnswer)
                              ?.content ||
                            userAnswer ||
                            "(No answer)"
                          : userAnswer || "(No answer)"}
                        {options && userAnswer && (
                          <span className="ml-2 px-2 py-0.5 bg-white rounded border text-xs">
                            {userAnswer}
                          </span>
                        )}
                      </p>
                    </div>

                    {!isCorrect && (
                      <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                        <p className="text-sm font-semibold mb-1 text-blue-700">
                          Correct Answer:
                        </p>
                        <p className="font-medium text-blue-900">
                          {options
                            ? options.find((o) => o.label === question.answer)
                                ?.content || question.answer
                            : question.answer}
                          {options && (
                            <span className="ml-2 px-2 py-0.5 bg-white rounded border text-xs">
                              {question.answer}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {question.explanation && !isCorrect && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-gray-500">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      </div>
    );
  }

  // Exam UI
  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 relative items-start">
      {/* Left Sidebar - Sticky */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 order-2 lg:order-1 lg:sticky lg:top-8">
        {/* Timer */}
        <GlassPanel className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#4c669a]">
              Time Remaining
            </span>
            {timeLeft < 300 && (
              <AlertTriangle className="size-5 text-red-500 animate-pulse" />
            )}
          </div>
          <div
            className={`text-3xl font-mono font-bold text-center ${
              timeLeft < 300 ? "text-red-500" : "text-[#0d121b] dark:text-white"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </GlassPanel>

        {/* Submit Button */}
        <GlassPanel className="p-6 shadow-lg space-y-4">
          <p className="text-sm text-[#4c669a] text-center">
            Answered: {Object.keys(answers).length} / {questions.length}
          </p>
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
            onClick={handleExit}
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4 mr-2" />
            Exit Exam
          </Button>
        </GlassPanel>
      </aside>

      {/* Main Content - Vertical List */}
      <div className="flex-1 flex flex-col gap-8 order-1 lg:order-2 pb-20">
        <GlassPanel className="p-6 mb-2">
          <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
          <p className="text-[#4c669a]">
            {questions.length} questions &bull; {exam.duration_minutes} minutes
          </p>
        </GlassPanel>

        {questions.map((question, index) => {
          const options = question.options as unknown as
            | QuestionOption[]
            | null;
          const answerValue = answers[question.id];

          return (
            <GlassPanel key={question.id} className="p-6 lg:p-8 shadow-lg">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-[#4c669a] bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Question {index + 1}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  {question.type.replace("_", " ")}
                </span>
              </div>

              {/* Question Content */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">{question.title}</h3>
                <LatexContent className="text-[#4c669a] leading-relaxed mb-4">
                  {question.content}
                </LatexContent>
                {question.code_snippet && (
                  <CodeBlock code={question.code_snippet} />
                )}
              </div>

              {/* Options/Input */}
              <div className="space-y-3">
                {/* True/False Type */}
                {question.type === "true_false" ? (
                  <div className="grid grid-cols-2 gap-4">
                    {["True", "False"].map((option) => {
                      const isSelected = answerValue === option;

                      return (
                        <button
                          key={option}
                          onClick={() =>
                            !isFinished &&
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: option,
                            }))
                          }
                          className={`p-6 rounded-xl text-center transition-all border ${
                            isSelected
                              ? "bg-[#135bec]/10 border-[#135bec] text-[#135bec]"
                              : "bg-white/50 border-gray-200 hover:border-[#135bec]/50"
                          }`}
                        >
                          <span
                            className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${
                              isSelected
                                ? "bg-[#135bec] text-white"
                                : option === "True"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : options && options.length > 0 ? (
                  options.map((option) => {
                    const isSelected = answerValue === option.label;

                    return (
                      <button
                        key={option.label}
                        onClick={() =>
                          !isFinished &&
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option.label,
                          }))
                        }
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-start gap-4 border ${
                          isSelected
                            ? "bg-[#135bec]/10 border-[#135bec] text-[#135bec]"
                            : "bg-white/50 border-gray-200 hover:border-[#135bec]/50"
                        }`}
                      >
                        <span
                          className={`size-6 shrink-0 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                            isSelected
                              ? "bg-[#135bec] text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {option.label}
                        </span>
                        <span>{option.content}</span>
                      </button>
                    );
                  })
                ) : (
                  <textarea
                    value={answerValue || ""}
                    onChange={(e) =>
                      !isFinished &&
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: e.target.value,
                      }))
                    }
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-xl border border-gray-200 text-base min-h-[120px] outline-none focus:border-[#135bec] transition-all bg-white/50 focus:bg-white resize-y"
                  />
                )}
              </div>
            </GlassPanel>
          );
        })}

        {visibleCount < questions.length && (
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="w-full"
          >
            Show More ({questions.length - visibleCount} remaining)
          </Button>
        )}
      </div>
    </div>
  );
}
