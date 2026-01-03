"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { createClient } from "@/lib/supabase/client";
import { Question, Profile, QuestionOption } from "@/types/database";
import {
  Bookmark,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Timer,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ImmersiveSessionProps {
  initialQuestion: Question | null;
  subjectId: number;
  subjectName: string;
  user: Profile;
}

export default function ImmersiveSession({
  initialQuestion,
  subjectId,
  subjectName,
  user,
}: ImmersiveSessionProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    initialQuestion
  );
  const [previousQuestion, setPreviousQuestion] = useState<Question | null>(
    null
  );
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Flow Mode State
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // AI Tutor State
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      // Play sound or notify?
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(25 * 60);
  };

  // Local bookmarks state
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Reset bookmark state when question changes
  useEffect(() => {
    if (currentQuestion) {
      // Check if current question is bookmarked
      const checkBookmark = async () => {
        const { data } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", user.id)
          .eq("question_id", currentQuestion.id)
          .single();
        setIsBookmarked(!!data);
      };
      checkBookmark();
    }
  }, [currentQuestion?.id, user.id]);

  const fetchRandomQuestion = useCallback(async () => {
    setIsLoading(true);

    // Fetch random question using random ordering
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("subject_id", subjectId)
      .order("id", { ascending: Math.random() > 0.5 }) // Pseudo-random
      .limit(10);

    if (data && data.length > 0) {
      // Pick a random one from the batch that isn't the current question
      const filtered = data.filter(
        (q: Question) => q.id !== currentQuestion?.id
      );
      const randomIndex = Math.floor(Math.random() * filtered.length);
      return (filtered[randomIndex] || data[0]) as Question;
    }
    return null;
  }, [subjectId, currentQuestion?.id]);

  const handleSelectAnswer = (answer: string) => {
    if (isChecked) return;
    setUserAnswer(answer);
  };

  const handleCheck = async () => {
    if (!userAnswer || !currentQuestion) return;
    setIsChecked(true);

    const isCorrect = userAnswer === currentQuestion.answer;

    // Record answer for progress tracking
    const { recordAnswer } = await import("@/lib/actions/recordAnswer");
    await recordAnswer(currentQuestion.id, userAnswer, isCorrect, "immersive");

    // Only record mistake if wrong
    if (!isCorrect) {
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
          last_wrong_answer: userAnswer,
          last_error_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,question_id" }
      );
    }

    setQuestionsAnswered((prev) => prev + 1);
  };

  const handleNext = async () => {
    setPreviousQuestion(currentQuestion);
    setUserAnswer("");
    setIsChecked(false);
    setIsBookmarked(false);

    const nextQuestion = await fetchRandomQuestion();
    setCurrentQuestion(nextQuestion);
    setIsLoading(false);
  };

  const toggleBookmark = async () => {
    if (!currentQuestion) return;

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("question_id", currentQuestion.id);
      setIsBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({
        user_id: user.id,
        question_id: currentQuestion.id,
      } as any);
      setIsBookmarked(true);
    }
  };

  const handleExit = () => {
    router.push("/subjects");
  };

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-900">
        <div className="text-center">
          <Sparkles className="size-16 mx-auto mb-4 opacity-30 text-purple-500" />
          <p className="text-xl font-medium">
            No questions available for this subject.
          </p>
          <Button
            variant="secondary"
            className="mt-6 border-gray-200"
            onClick={handleExit}
          >
            Back to Subjects
          </Button>
        </div>
      </div>
    );
  }

  const options = currentQuestion.options as unknown as QuestionOption[] | null;
  const isCorrect = userAnswer === currentQuestion.answer;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Exit Button */}
      <button
        onClick={handleExit}
        className="absolute top-4 right-4 p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all shadow-sm"
        title="Exit Immersive Mode"
      >
        <X className="size-6" />
      </button>

      {/* Top Left Stats & Timer */}
      <div
        className={`absolute top-4 left-4 flex items-center gap-4 transition-opacity duration-500 ${
          isFocusMode ? "opacity-0 hover:opacity-100" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-purple-100 shadow-sm">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 font-mono text-sm font-medium ${
              isTimerActive ? "text-purple-600" : "text-gray-500"
            }`}
          >
            <Timer
              className={`size-4 ${isTimerActive ? "animate-pulse" : ""}`}
            />
            {formatTime(timeLeft)}
          </button>
        </div>

        <span className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-500">
          {questionsAnswered} answered
        </span>
      </div>

      {/* Focus Mode Toggle (Top Middle) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
            isFocusMode
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
              : "bg-white/50 text-gray-400 hover:bg-white hover:text-purple-600"
          }`}
        >
          {isFocusMode ? "Focus Mode On" : "Focus Mode Off"}
        </button>
      </div>

      {/* Main Content - 3 column layout */}
      <div className="w-full max-w-6xl grid grid-cols-12 gap-6 items-center">
        {/* Previous Question (faded) - Hide in Focus Mode */}
        <div
          className={`col-span-2 hidden lg:block transition-opacity duration-500 ${
            isFocusMode ? "opacity-0" : "opacity-100"
          }`}
        >
          {previousQuestion && (
            <div className="opacity-30 scale-90 transform transition-all">
              <GlassPanel className="p-4 bg-gray-50 border-gray-200">
                <p className="text-gray-600 text-sm line-clamp-4">
                  {previousQuestion.content}
                </p>
              </GlassPanel>
            </div>
          )}
        </div>

        {/* Current Question */}
        <div className="col-span-12 lg:col-span-8">
          <GlassPanel className="p-8 bg-white border border-gray-200 shadow-xl">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-purple-600 text-sm font-semibold uppercase tracking-wider">
                {subjectName}
              </span>
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-all ${
                  isBookmarked
                    ? "text-yellow-500 bg-yellow-400/10"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Bookmark
                  className={`size-5 ${isBookmarked ? "fill-yellow-500" : ""}`}
                />
              </button>
            </div>

            {/* Question Content */}
            <div className="mb-8">
              <p className="text-gray-900 text-xl font-medium leading-relaxed mb-6">
                {currentQuestion.content}
              </p>
              {currentQuestion.code_snippet && (
                <CodeBlock code={currentQuestion.code_snippet} />
              )}
            </div>

            {/* Options or Text Input */}
            <div className="space-y-3 mb-8">
              {options && options.length > 0 ? (
                options.map((option) => {
                  const isSelected = userAnswer === option.label;
                  const isCorrectAnswer =
                    currentQuestion.answer === option.label;

                  let style =
                    "bg-white border-gray-200 hover:bg-gray-50 text-gray-800";

                  if (isChecked) {
                    if (isSelected && isCorrectAnswer) {
                      style = "bg-green-50 border-green-500 text-green-700";
                    } else if (isSelected && !isCorrectAnswer) {
                      style = "bg-red-50 border-red-500 text-red-700";
                    } else if (isCorrectAnswer) {
                      style =
                        "bg-green-50/50 border-green-500/50 text-green-700";
                    } else {
                      style =
                        "opacity-50 bg-gray-50 border-gray-100 text-gray-400";
                    }
                  } else if (isSelected) {
                    style =
                      "bg-purple-50 border-purple-500 text-purple-700 shadow-sm";
                  }

                  return (
                    <button
                      key={option.label}
                      onClick={() => handleSelectAnswer(option.label)}
                      disabled={isChecked}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 border ${style}`}
                    >
                      <span className="font-bold text-lg">{option.label}.</span>
                      <span>{option.content}</span>
                      {isChecked &&
                        isSelected &&
                        (isCorrectAnswer ? (
                          <CheckCircle2 className="size-5 ml-auto" />
                        ) : (
                          <XCircle className="size-5 ml-auto" />
                        ))}
                    </button>
                  );
                })
              ) : (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isChecked}
                  placeholder="Type your answer..."
                  className={`w-full p-4 rounded-xl border bg-gray-50 text-gray-900 text-lg font-medium outline-none transition-all placeholder:text-gray-400 ${
                    isChecked
                      ? isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-purple-500 focus:bg-white"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userAnswer && !isChecked) {
                      handleCheck();
                    }
                  }}
                />
              )}
            </div>

            {/* Feedback */}
            {isChecked && (
              <div
                className={`mb-6 p-4 rounded-xl ${
                  isCorrect
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <p className="font-bold mb-1">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
                {!isCorrect && (
                  <p className="text-sm opacity-80">
                    The correct answer is:{" "}
                    <span className="font-mono font-bold">
                      {currentQuestion.answer}
                    </span>
                  </p>
                )}

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
                      className="gap-2"
                    >
                      {isLoadingAI ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {isLoadingAI ? "Generating..." : "AI Tutor"}
                    </Button>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
                        <Sparkles className="size-4" />
                        AI Tutor
                      </div>
                      <div className="text-sm text-blue-800">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0 leading-relaxed">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <span className="font-bold text-blue-900">
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
                              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-xs">
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              {!isChecked && (
                <Button
                  onClick={handleCheck}
                  disabled={!userAnswer}
                  className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
                  size="lg"
                >
                  Check Answer
                </Button>
              )}

              {isChecked && (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleBookmark}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isBookmarked
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Bookmark
                        className={`size-4 ${
                          isBookmarked ? "fill-yellow-500" : ""
                        }`}
                      />
                      {isBookmarked ? "Bookmarked" : "Bookmark"}
                    </button>
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="bg-purple-500 hover:bg-purple-600"
                    size="lg"
                  >
                    {isLoading ? "Loading..." : "Next Question"}
                    <ChevronRight className="size-5 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Next Question Preview (empty placeholder for symmetry) */}
        <div className="col-span-2 hidden lg:block">
          {/* Could show a loading shimmer for next question */}
        </div>
      </div>
    </div>
  );
}
