"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Question, Profile, QuestionOption } from "@/types/database";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { LatexContent } from "@/components/ui/LatexContent";
import { ResultsModal } from "@/components/ui/ResultsModal";
import { FeedbackButton } from "@/components/question/FeedbackButton";
import { HandwriteCanvas } from "@/components/ui/HandwriteCanvas";
import {
  TrendingUp,
  Timer,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Info,
  CheckCircle2,
  XCircle,
  Check,
  Share2,
  BookPlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { encodeId } from "@/lib/ids";

interface PracticeSessionProps {
  questions: Question[];
  user: Profile;
  subjectId: number;
  mode?: "practice" | "standalone";
  enableTimer?: boolean;
}

export function PracticeSession({
  questions,
  user,
  subjectId,
  mode = "practice",
  enableTimer = true,
}: PracticeSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>(
    {}
  );
  // ... (keep state)
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [addedMistake, setAddedMistake] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isChecked = checkedAnswers[currentQuestion.id];
  const supabase: any = createClient();

  // ... (keep helper functions: handleShare)

  const handleShare = async () => {
    const url = `${window.location.origin}/question/${encodeId(
      currentQuestion.id
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("question_id")
        .eq("user_id", user.id)
        .in(
          "question_id",
          questions.map((q) => q.id)
        );

      if (data) {
        setBookmarks(new Set(data.map((b: any) => b.question_id)));
      }
    };
    fetchBookmarks();
  }, [questions, user.id]);

  // Timer
  useEffect(() => {
    if (!enableTimer || showResults || isSubmitting) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [enableTimer, showResults, isSubmitting]);

  const handleAnswer = (answer: string) => {
    if (isChecked) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleAddToMistakes = async () => {
    setIsAddingMistake(true);
    const questionId = currentQuestion.id;

    // Check if already exists
    const { data: existing } = await supabase
      .from("mistakes")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .single();

    if (!existing) {
      await supabase.from("mistakes").insert({
        user_id: user.id,
        question_id: questionId,
        error_count: 1,
        error_type: "manual",
        last_error_at: new Date().toISOString(),
      } as any);
    }

    setAddedMistake(true);
    setTimeout(() => setAddedMistake(false), 2000);
    setIsAddingMistake(false);
  };

  const toggleBookmark = async () => {
    const questionId = currentQuestion.id;
    const isBookmarked = bookmarks.has(questionId);

    // Optimistic update
    const newBookmarks = new Set(bookmarks);
    if (isBookmarked) {
      newBookmarks.delete(questionId);
    } else {
      newBookmarks.add(questionId);
    }
    setBookmarks(newBookmarks);

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", questionId);
    } else {
      await supabase.from("bookmarks").insert({
        user_id: user.id,
        question_id: questionId,
      } as any);
    }
  };

  const handleCheck = async () => {
    const answer = answers[currentQuestion.id];
    if (!answer) return;

    setCheckedAnswers((prev) => ({ ...prev, [currentQuestion.id]: true }));

    const isCorrect =
      currentQuestion.type === "handwrite"
        ? true // Always marked "correct" for logic flow, but user sees self-check
        : answer === currentQuestion.answer;

    if (!isCorrect) {
      // Record mistake immediately
      const { data: existingData } = await supabase
        .from("mistakes")
        .select("error_count")
        .eq("user_id", user.id)
        .eq("question_id", currentQuestion.id)
        .single();

      const existing = existingData as { error_count: number } | null;
      const newCount = (existing?.error_count || 0) + 1;

      await supabase.from("mistakes").upsert(
        {
          user_id: user.id,
          question_id: currentQuestion.id,
          error_count: newCount,
          error_type: "wrong_answer",
          last_wrong_answer: answer,
          last_error_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,question_id" }
      );
    }
  };

  const handleNext = async () => {
    if (!answers[currentQuestion.id]) return;

    // If not checked, check first
    if (!isChecked) {
      await handleCheck();
      return;
    }

    // Move to next or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await finishPractice();
    }
  };

  const finishPractice = async () => {
    setIsSubmitting(true);

    try {
      let correctCount = 0;
      const answerPromises = [];

      // 1. Record answers and identify mistakes
      for (const q of questions) {
        // Skip unanswered questions in metrics, or mark them?
        // Usually practice assumes you try all.
        const userAnswer = answers[q.id];
        if (!userAnswer) continue;

        const isCorrect = userAnswer === q.answer;

        if (isCorrect) correctCount++;

        answerPromises.push(
          supabase.from("user_answers").insert({
            user_id: user.id,
            question_id: q.id,
            user_answer: userAnswer,
            is_correct: isCorrect,
            time_spent: Math.round(elapsedTime / questions.length), // Approx time per question
          } as any)
        );
      }

      await Promise.all([...answerPromises]);

      // 2. Update user progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("completed_count, correct_count")
        .eq("user_id", user.id)
        .eq("subject_id", subjectId)
        .single();

      const progress = progressData as {
        completed_count: number;
        correct_count: number;
      } | null;

      const newCompleted =
        (progress?.completed_count || 0) + Object.keys(checkedAnswers).length;
      const newCorrect = (progress?.correct_count || 0) + correctCount;

      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          subject_id: subjectId,
          completed_count: newCompleted,
          correct_count: newCorrect,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,subject_id" }
      );

      // 3. Update last practice date (no streak)
      await supabase
        .from("profiles")
        .update({
          last_practice_date: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      // Show results modal
      setFinalScore(correctCount);
      setShowResults(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting results:", error);
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-600";
      case "medium":
        return "bg-yellow-100 text-yellow-600";
      case "hard":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Parse options safely
  const options = currentQuestion.options as unknown as QuestionOption[] | null;

  // Calculate progress based on CHECKED answers
  const progressPercentage =
    (Object.keys(checkedAnswers).length / questions.length) * 100;

  return (
    <div
      className={`flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 ${
        mode === "standalone" ? "items-center justify-center" : ""
      }`}
    >
      {/* Left Sidebar - Progress (Only in Practice Mode) */}
      {mode === "practice" && (
        <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0 order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Progress
              </p>
              <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {Object.keys(checkedAnswers).length}
              <span className="text-lg text-gray-400 font-medium ml-1">
                /{questions.length}
              </span>
            </h3>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Question Navigator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Questions
            </h3>
            <div className="max-h-[280px] overflow-y-auto pr-1 -mr-1">
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, i) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = i === currentIndex;
                  const wasChecked = checkedAnswers[q.id];

                  let btnClass =
                    "bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent";

                  if (isCurrent) {
                    btnClass =
                      "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 border border-transparent scale-105";
                  } else if (wasChecked) {
                    btnClass =
                      "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`size-9 rounded-lg font-semibold text-xs flex items-center justify-center transition-all duration-200 ${btnClass}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content - Question */}
      <div
        className={`flex-1 flex flex-col gap-6 order-1 lg:order-2 ${
          mode === "standalone" ? "w-full max-w-4xl" : ""
        }`}
      >
        <GlassPanel className="p-6 lg:p-8 shadow-lg flex-1">
          {/* Question Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                  currentQuestion.difficulty === "easy"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : currentQuestion.difficulty === "medium"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {currentQuestion.difficulty}
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                {currentQuestion.title}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {mode === "practice" && enableTimer && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-transparent dark:border-gray-700">
                  <Timer className="size-4" />
                  <span className="font-mono text-sm">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
              )}

              {/* Share Button (Always useful) */}
              <button
                onClick={handleShare}
                className="p-2 rounded-full transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-600 relative group"
                title="Share Question"
              >
                <Share2 className="size-5" />
                {copied && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-100 transition-opacity whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>

              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-all ${
                  bookmarks.has(currentQuestion.id)
                    ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Bookmark
                  className={`size-5 ${
                    bookmarks.has(currentQuestion.id) ? "fill-yellow-500" : ""
                  }`}
                />
              </button>

              <button
                onClick={handleAddToMistakes}
                disabled={isAddingMistake}
                className="p-2 rounded-full transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-600 relative group"
                title="Add to Mistakes"
              >
                {addedMistake ? (
                  <CheckCircle2 className="size-5 text-green-500" />
                ) : (
                  <BookPlus className="size-5" />
                )}
                {addedMistake && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-100 transition-opacity whitespace-nowrap">
                    Added!
                  </span>
                )}
              </button>

              <FeedbackButton
                questionId={currentQuestion.id}
                userId={user.id}
              />
            </div>
          </div>

          {/* Question Content & Feedback Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 min-w-0">
              {/* Question Text */}
              <div className="mb-8">
                <LatexContent className="text-slate-900 dark:text-gray-100 text-lg leading-relaxed mb-4">
                  {currentQuestion.content}
                </LatexContent>
                {currentQuestion.code_snippet && (
                  <CodeBlock code={currentQuestion.code_snippet} />
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {/* True/False Question Type */}
                {currentQuestion.type === "true_false" ? (
                  <div className="grid grid-cols-2 gap-4">
                    {["True", "False"].map((option) => {
                      const userAnswer = answers[currentQuestion.id];
                      const isSelected = userAnswer === option;
                      const isCorrectAnswer = currentQuestion.answer === option;

                      let style =
                        "bg-white/50 border-gray-200 hover:border-[#135bec]/50 hover:bg-white";
                      let badgeStyle =
                        option === "True"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600";

                      if (isChecked) {
                        if (isSelected && isCorrectAnswer) {
                          style =
                            "bg-green-100/50 border-green-500 text-green-700";
                          badgeStyle = "bg-green-500 text-white";
                        } else if (isSelected && !isCorrectAnswer) {
                          style = "bg-red-100/50 border-red-500 text-red-700";
                          badgeStyle = "bg-red-500 text-white";
                        } else if (isCorrectAnswer) {
                          style = "bg-green-50/50 border-green-300";
                          badgeStyle = "bg-green-100 text-green-700";
                        } else {
                          style = "opacity-50";
                        }
                      } else if (isSelected) {
                        style =
                          "bg-[#135bec]/10 border-[#135bec] text-[#135bec]";
                        badgeStyle = "bg-[#135bec] text-white";
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          disabled={isChecked}
                          className={`p-6 rounded-xl text-center transition-all border ${style}`}
                        >
                          <span
                            className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${badgeStyle}`}
                          >
                            {option}
                          </span>
                          {isChecked &&
                            isSelected &&
                            (isCorrectAnswer ? (
                              <CheckCircle2 className="size-5 mx-auto mt-2" />
                            ) : (
                              <XCircle className="size-5 mx-auto mt-2" />
                            ))}
                        </button>
                      );
                    })}
                  </div>
                ) : options && options.length > 0 ? (
                  options.map((option) => {
                    const userAnswer = answers[currentQuestion.id];
                    const isSelected = userAnswer === option.label;
                    const isCorrectAnswer =
                      currentQuestion.answer === option.label;

                    let style =
                      "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-gray-100";
                    let badgeStyle =
                      "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";

                    if (isChecked) {
                      if (isSelected && isCorrectAnswer) {
                        style =
                          "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300";
                        badgeStyle = "bg-green-500 text-white";
                      } else if (isSelected && !isCorrectAnswer) {
                        style =
                          "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300";
                        badgeStyle = "bg-red-500 text-white";
                      } else if (isCorrectAnswer) {
                        style =
                          "bg-green-50/50 dark:bg-green-900/10 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400";
                        badgeStyle =
                          "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                      } else {
                        style =
                          "opacity-50 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-500";
                      }
                    } else if (isSelected) {
                      style =
                        "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-300";
                      badgeStyle = "bg-blue-500 text-white";
                    }

                    return (
                      <button
                        key={option.label}
                        onClick={() => handleAnswer(option.label)}
                        disabled={isChecked}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 border ${style}`}
                      >
                        <span
                          className={`size-8 rounded-full flex items-center justify-center font-bold text-sm ${badgeStyle}`}
                        >
                          {option.label}
                        </span>
                        <span className="font-medium text-current">
                          {option.content}
                        </span>
                        {isChecked &&
                          isSelected &&
                          (isCorrectAnswer ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <XCircle className="size-5" />
                          ))}
                      </button>
                    );
                  })
                ) : // NON-MCQ Text Input
                currentQuestion.type === "handwrite" ? (
                  <div className="space-y-4">
                    <HandwriteCanvas
                      height={400}
                      onStroke={() => handleAnswer("handwritten_content")}
                      readOnly={isChecked}
                      strokeColor={
                        isChecked
                          ? "#9ca3af" // Gray out user answer when checking
                          : undefined
                      }
                    />
                    {isChecked && (
                      <div className="p-4 rounded-xl bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800">
                        <p className="font-bold text-green-800 dark:text-green-300 mb-2">
                          Correct Answer:
                        </p>
                        <div className="prose dark:prose-invert max-w-none">
                          <p>{currentQuestion.answer}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 text-center">
                      Draw your answer above. Self-check your result.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      disabled={isChecked}
                      placeholder="Type your answer here..."
                      className={`w-full p-4 rounded-xl border bg-white/50 dark:bg-slate-800/50 text-lg font-medium outline-none transition-all dark:text-white ${
                        isChecked
                          ? answers[currentQuestion.id] ===
                            currentQuestion.answer
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                          : "border-gray-200 dark:border-gray-700 focus:border-[#135bec] dark:focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10"
                      }`}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !isChecked &&
                          answers[currentQuestion.id]
                        ) {
                          mode === "standalone" ? handleCheck() : handleNext();
                        }
                      }}
                    />
                    {isChecked && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium">Correct Answer:</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">
                          {currentQuestion.answer}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Feedback & AI Tutor */}
            {isChecked && (
              <div
                className={`w-full lg:w-[400px] shrink-0 p-6 rounded-xl self-start sticky top-6 ${
                  answers[currentQuestion.id] === currentQuestion.answer
                    ? "bg-green-50 border border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                    : "bg-red-50 border border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  {answers[currentQuestion.id] === currentQuestion.answer ? (
                    <Lightbulb className="size-5" />
                  ) : (
                    <Info className="size-5" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold mb-1">
                      {answers[currentQuestion.id] === currentQuestion.answer
                        ? "Correct!"
                        : "Incorrect"}
                    </p>
                    <p className="text-sm opacity-90">
                      {currentQuestion.explanation ||
                        "No explanation provided."}
                    </p>
                  </div>
                </div>

                {/* AI Tutor Button */}
                <div className="mt-4 pt-4 border-t border-current/10">
                  {!aiExplanation ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setIsLoadingAI(true);
                        const { getExplanation } = await import(
                          "@/lib/actions/getExplanation"
                        );
                        const result = await getExplanation(
                          currentQuestion.content,
                          currentQuestion.answer,
                          currentQuestion.code_snippet || undefined
                        );
                        if (result.success && result.explanation) {
                          setAiExplanation(result.explanation);
                        }
                        setIsLoadingAI(false);
                      }}
                      disabled={isLoadingAI}
                      className="gap-2 w-full"
                    >
                      {isLoadingAI ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {isLoadingAI ? "Generating..." : "AI Tutor Explanation"}
                    </Button>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-2">
                        <Sparkles className="size-4" />
                        AI Tutor
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 leading-relaxed">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <span className="font-bold text-blue-900 dark:text-blue-100">
                                {children}
                              </span>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="pl-1">{children}</li>
                            ),
                            code: ({ children }) => (
                              <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded font-mono text-xs">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {aiExplanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </GlassPanel>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {mode === "standalone" ? (
            <Button variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0 || isSubmitting}
            >
              <ArrowLeft className="mr-2 size-4" />
              Previous
            </Button>
          )}

          {mode === "standalone" ? (
            !isChecked && (
              <Button
                onClick={handleCheck}
                disabled={!answers[currentQuestion.id]}
                className="bg-[#135bec] text-white hover:bg-blue-600"
              >
                Submit <Check className="size-4 ml-2" />
              </Button>
            )
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id] || isSubmitting}
              variant={isChecked ? "primary" : "secondary"}
              className={
                !isChecked && answers[currentQuestion.id]
                  ? "bg-[#135bec] text-white hover:bg-blue-600"
                  : ""
              }
            >
              {isSubmitting
                ? "Submitting..."
                : isChecked
                ? currentIndex === questions.length - 1
                  ? "Finish"
                  : "Next Question"
                : "Check Answer"}
              {!isSubmitting &&
                (isChecked ? (
                  <ArrowRight className="size-4 ml-2" />
                ) : (
                  <Check className="size-4 ml-2" />
                ))}
            </Button>
          )}
        </div>
      </div>

      {/* Results Modal - Only for Practice Mode */}
      {mode === "practice" && (
        <ResultsModal
          isOpen={showResults}
          score={finalScore}
          total={questions.length}
          timeSpent={elapsedTime}
          subjectId={subjectId}
          onReviewMistakes={() => router.push("/profile/mistakes")}
          onPracticeAgain={() => {
            setShowResults(false);
            setCurrentIndex(0);
            setAnswers({});
            setCheckedAnswers({});
            setElapsedTime(0);
            setFinalScore(0);
          }}
        />
      )}
    </div>
  );
}
