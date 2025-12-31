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
} from "lucide-react";
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

    const isCorrect = answer === currentQuestion.answer;

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
        <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0 order-2 lg:order-1">
          <GlassPanel className="p-6 shadow-lg flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  Progress
                </p>
                <h3 className="text-2xl font-bold">
                  {Object.keys(checkedAnswers).length}
                  <span className="text-lg text-gray-400 font-medium">
                    /{questions.length}
                  </span>
                </h3>
              </div>
              <div className="size-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#135bec] h-2 rounded-full transition-all"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel className="p-6 shadow-lg flex-1">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Questions
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = i === currentIndex;
                const isCorrect = answers[q.id] === q.answer;

                let btnClass =
                  "bg-white border border-gray-200 text-gray-600 hover:border-[#135bec]";

                if (isCurrent) {
                  btnClass =
                    "bg-[#135bec] text-white shadow-lg shadow-blue-500/30";
                } else if (isAnswered && checkedAnswers[q.id]) {
                  // In practice mode, maybe valid to show color? Or keep hidden?
                  // Original logic hid correctness. Let's keep it simple: blue if answered.
                  btnClass = "bg-blue-50 text-[#135bec] border border-blue-100";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`size-10 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${btnClass}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </GlassPanel>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                  currentQuestion.difficulty
                )}`}
              >
                {currentQuestion.difficulty.toUpperCase()}
              </span>
              <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              {mode === "practice" && enableTimer && (
                <div className="flex items-center gap-2 text-gray-500 bg-white/50 px-3 py-1.5 rounded-full">
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
                    ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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

          {/* Question Content */}
          <div className="mb-8">
            <LatexContent className="text-[#0d121b] text-lg leading-relaxed mb-4">
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
                      style = "bg-green-100/50 border-green-500 text-green-700";
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
                    style = "bg-[#135bec]/10 border-[#135bec] text-[#135bec]";
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
                const isCorrectAnswer = currentQuestion.answer === option.label;

                let style =
                  "bg-white/50 border-gray-200 hover:border-[#135bec]/50 hover:bg-white";
                let badgeStyle = "bg-gray-100 text-gray-600";

                if (isChecked) {
                  if (isSelected && isCorrectAnswer) {
                    style = "bg-green-100/50 border-green-500 text-green-700";
                    badgeStyle = "bg-green-500 text-white";
                  } else if (isSelected && !isCorrectAnswer) {
                    style = "bg-red-100/50 border-red-500 text-red-700";
                    badgeStyle = "bg-red-500 text-white";
                  } else if (isCorrectAnswer) {
                    style = "bg-green-50/50 border-green-300"; // Highlight correct answer
                    badgeStyle = "bg-green-100 text-green-700";
                  } else {
                    style = "opacity-50";
                  }
                } else if (isSelected) {
                  style = "bg-[#135bec]/10 border-[#135bec] text-[#135bec]";
                  badgeStyle = "bg-[#135bec] text-white";
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
                    <span className="font-medium">{option.content}</span>
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
            ) : (
              // NON-MCQ Text Input
              <div className="space-y-4">
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={isChecked}
                  placeholder="Type your answer here..."
                  className={`w-full p-4 rounded-xl border bg-white/50 text-lg font-medium outline-none transition-all ${
                    isChecked
                      ? answers[currentQuestion.id] === currentQuestion.answer
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10"
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

          {isChecked && (
            <div
              className={`mt-6 p-4 rounded-xl ${
                answers[currentQuestion.id] === currentQuestion.answer
                  ? "bg-green-50 border border-green-100 text-green-800"
                  : "bg-red-50 border border-red-100 text-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {answers[currentQuestion.id] === currentQuestion.answer ? (
                  <Lightbulb className="size-5" />
                ) : (
                  <Info className="size-5" />
                )}
                <div>
                  <p className="font-bold mb-1">
                    {answers[currentQuestion.id] === currentQuestion.answer
                      ? "Correct!"
                      : "Incorrect"}
                  </p>
                  <p className="text-sm opacity-90">
                    {currentQuestion.explanation || "No explanation provided."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Navigation */}
        <div className="flex items-center justify-between">
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
