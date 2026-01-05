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
  LogOut,
  Share2,
  BookPlus,
  Sparkles,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { encodeId } from "@/lib/ids";

interface PracticeSessionProps {
  questions: Question[];
  user: Profile;
  subjectId: number;
  mode?: "practice" | "standalone";
  enableTimer?: boolean;
  isGuest?: boolean;
}

export function PracticeSession({
  questions,
  user,
  subjectId,
  mode = "practice",
  enableTimer = true,
  isGuest = false,
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Handle Fullscreen changes (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFocusMode(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFocusMode = async () => {
    if (!isFocusMode) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
        // Still enable focus mode UI even if fullscreen fails
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

    // Intercept check for guest users
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }

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

    // Intercept next for guest users
    if (isGuest) {
      setShowLoginModal(true);
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

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    isChecked,
    answers,
    questions.length,
    isSubmitting,
    handleNext,
    handleCheck,
  ]);

  return (
    <div
      className={`flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 ${
        mode === "standalone" ? "items-center justify-center" : ""
      }`}
    >
      {/* Left Sidebar - Progress (Only in Practice Mode and NOT in Focus Mode) */}
      {mode === "practice" && !isFocusMode && (
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

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                className="w-full justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 group transform transition-all duration-200"
                onClick={() => router.push("/question-banks")}
              >
                <LogOut className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
                Exit
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content - Question */}
      <div
        className={`flex-1 flex flex-col gap-6 order-1 lg:order-2 ${
          mode === "standalone"
            ? "w-full max-w-4xl"
            : isFocusMode
            ? "w-full max-w-5xl mx-auto transition-all duration-500"
            : ""
        }`}
      >
        <div className="bg-white dark:bg-slate-900 shadow-2xl min-h-[800px] p-12 lg:p-16 relative flex flex-col font-serif overflow-hidden">
          {/* Exam Header */}
          <div className="flex justify-between items-end border-b-2 border-black dark:border-white pb-4 mb-12 text-black dark:text-white font-serif">
            <div className="text-sm space-y-1">
              <p className="font-bold">
                Semester 1 Examinations, {new Date().getFullYear()}
              </p>
              {currentQuestion.options &&
                Array.isArray(currentQuestion.options) &&
                currentQuestion.options.length > 0 && (
                  <p className="italic">Part A - Multiple Choice Questions</p>
                )}
            </div>
            <div className="text-right text-sm space-y-1">
              {currentQuestion.options &&
                Array.isArray(currentQuestion.options) &&
                currentQuestion.options.length > 0 && (
                  <p className="font-bold uppercase">Subject: {subjectId}</p>
                )}
              <p>
                Page {currentIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          {/* Controls Overlay (Focus Mode, Timer etc - moved to absolute top right for minimal interference) */}
          <div className="absolute top-4 right-4 flex items-center gap-4 print:hidden">
            <div
              className={`flex items-center gap-4 transition-opacity duration-300 ${
                isFocusMode ? "opacity-30 hover:opacity-100" : "opacity-100"
              }`}
            >
              {/* Focus Mode Toggle */}
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

              {mode === "practice" && enableTimer && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-sans">
                  <Timer className="size-3.5" />
                  <span className="font-mono">{formatTime(elapsedTime)}</span>
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
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-100 transition-opacity whitespace-nowrap sans-serif">
                    Copied!
                  </span>
                )}
              </button>

              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-all ${
                  bookmarks.has(currentQuestion.id)
                    ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
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
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-100 transition-opacity whitespace-nowrap sans-serif">
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
                {/* Part B Header for Non-MCQ */}
                {(!currentQuestion.options ||
                  !Array.isArray(currentQuestion.options) ||
                  currentQuestion.options.length === 0) && (
                  <div className="mb-8 font-serif text-black dark:text-white">
                    <h3 className="font-bold text-lg mb-2">
                      Part B – Short answer questions (8 marks)
                    </h3>
                    <p className="text-sm italic opacity-90">
                      There are questions in Part B. Please answer all questions
                      in the spaces provided on this examination paper.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <span className="font-bold text-lg select-none">
                    {currentIndex + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <LatexContent className="font-serif text-black dark:text-gray-100 text-lg leading-relaxed mb-4">
                      {currentQuestion.content}
                    </LatexContent>
                    {currentQuestion.code_snippet && (
                      <div className="max-w-full overflow-x-auto">
                        <CodeBlock code={currentQuestion.code_snippet} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Area: Options OR Input */}
                <div className="mt-8 pl-0 lg:pl-6">
                  {currentQuestion.options &&
                  Array.isArray(currentQuestion.options) &&
                  currentQuestion.options.length > 0 ? (
                    /* Multiple Choice Options */
                    <div className="space-y-4">
                      {(currentQuestion.options as any[])?.map(
                        (option: any, index: number) => {
                          const optionLabel =
                            String.fromCharCode(97 + index) + ")"; // a), b), c)...
                          const userAnswer = answers[currentQuestion.id];
                          const isSelected = userAnswer === option.label;
                          const isCorrect =
                            isChecked &&
                            option.label === currentQuestion.answer;
                          const isWrong =
                            isChecked &&
                            isSelected &&
                            option.label !== currentQuestion.answer;
                          const shouldShowCorrect =
                            isChecked &&
                            option.label === currentQuestion.answer;

                          return (
                            <div
                              key={option.label}
                              onClick={() =>
                                !isChecked && handleAnswer(option.label)
                              }
                              className={`group flex items-start gap-3 p-3 -ml-2 rounded-lg cursor-pointer transition-colors ${
                                !isChecked
                                  ? "hover:bg-gray-50 dark:hover:bg-gray-800"
                                  : ""
                              }`}
                            >
                              <span
                                className={`font-serif font-medium text-lg min-w-[32px] pt-0.5 ${
                                  isSelected || shouldShowCorrect
                                    ? "font-bold"
                                    : ""
                                } ${
                                  isCorrect
                                    ? "text-green-600"
                                    : isWrong
                                    ? "text-red-600"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {optionLabel}
                              </span>
                              <div
                                className={`flex-1 font-serif text-lg leading-relaxed ${
                                  isCorrect
                                    ? "text-green-600"
                                    : isWrong
                                    ? "text-red-600"
                                    : "text-gray-900 dark:text-gray-100"
                                } ${
                                  isSelected
                                    ? "underline decoration-2 underline-offset-4"
                                    : ""
                                }`}
                              >
                                {option.content}
                                {/* Feedback Markers */}
                                {isChecked && (
                                  <span className="ml-2 font-bold sans-serif text-sm">
                                    {isCorrect && (
                                      <span className="text-green-600">
                                        (Correct)
                                      </span>
                                    )}
                                    {isWrong && (
                                      <span className="text-red-600">
                                        (Your Answer)
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : currentQuestion.type === "handwrite" ? (
                    /* Handwriting Canvas */
                    <div className="w-full h-[500px] border-2 border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-canvas-dark relative">
                      <HandwriteCanvas
                        strokeColor={isFocusMode ? "#000" : "#135bec"}
                        onStroke={() => {
                          // Mark as answered if stroking
                          if (!answers[currentQuestion.id]) {
                            handleAnswer("handwritten_content");
                          }
                        }}
                        readOnly={isChecked}
                      />
                      {/* Background Lines for paper feel */}
                      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(transparent_23px,#000_24px)] bg-[size:100%_24px]" />
                    </div>
                  ) : (
                    /* Default Text Input (Essay / Fill Blank) */
                    <div className="relative">
                      <div className="absolute -left-6 top-8 bottom-8 w-0.5 bg-red-300/30 hidden lg:block" />
                      <textarea
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswer(e.target.value)}
                        disabled={isChecked}
                        placeholder=""
                        className="w-full min-h-[400px] p-0 bg-[repeating-linear-gradient(transparent,transparent_31px,#000000_32px)] text-lg leading-8 font-serif text-black dark:text-gray-100 border-none focus:ring-0 resize-y placeholder:text-gray-300 dark:placeholder:text-gray-700 bg-transparent translate-y-[6px]"
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
                          currentQuestion.code_snippet || undefined,
                          currentQuestion.id
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
        </div>

        {/* Navigation & Actions Footer (External to paper or bottom of paper) */}
        <div className="mt-6 flex items-center justify-between print:hidden">
          <Button
            variant="ghost"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white group gap-2"
          >
            <span className="text-xs px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              ↑
            </span>
            Previous
          </Button>

          <Button
            onClick={isChecked ? handleNext : () => handleCheck()}
            className="px-8 bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black rounded-full shadow-lg transition-all active:scale-95 group gap-2"
          >
            {isChecked
              ? currentIndex === questions.length - 1
                ? "Finish Exam"
                : "Next Question"
              : "Submit Answer"}
            <span className="text-xs px-1.5 py-0.5 rounded border border-white/20 bg-white/10 text-white/80 group-hover:text-white transition-colors">
              ↓
            </span>
          </Button>
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
