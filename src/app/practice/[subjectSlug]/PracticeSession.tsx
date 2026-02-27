"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Question, Profile, QuestionOption } from "@/types/database";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { LatexContent } from "@/components/ui/LatexContent";
import { ResultsModal } from "@/components/ui/ResultsModal";
import { PenCircle } from "@/components/ui/PenCircle";
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
  BookPlus,
  Maximize2,
  Minimize2,
  List,
  ChevronDown,
  ChevronRight,
  Layout,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

const HandwriteCanvas = dynamic(
  () =>
    import("@/components/ui/HandwriteCanvas").then((m) => m.HandwriteCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] w-full rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-canvas-dark animate-pulse" />
    ),
  },
);

interface PracticeSessionProps {
  questions: Question[];
  user: Profile;
  subjectId: number;
  mode?: "practice" | "standalone";
  enableTimer?: boolean;
  isGuest?: boolean;
  exitLink?: string;
  homeworkId?: number;
  homeworkMode?: "practice" | "immersive" | "flashcards";
  weeklyPracticeId?: number;
  weeklyPracticeMode?: "practice" | "immersive" | "flashcards";
  showTopics?: boolean;
}

export function PracticeSession({
  questions,
  user,
  subjectId,
  mode = "practice",
  enableTimer = true,
  isGuest = false,
  exitLink = "/library",
  homeworkId,
  homeworkMode = "practice",
  weeklyPracticeId,
  weeklyPracticeMode = "practice",
  showTopics = true,
}: PracticeSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>(
    {},
  );
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [addedMistake, setAddedMistake] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [topics, setTopics] = useState<Record<number, string>>({});
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const progressSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isHydratingSessionRef = useRef(true);
  const hasRestoredSessionRef = useRef(false);

  const supabase: any = createClient();

  const sessionStorageKey = useMemo(() => {
    const questionSignature = questions.map((q) => q.id).join("-");
    if (homeworkId) return `practice-session:homework:${homeworkId}`;
    if (weeklyPracticeId) return `practice-session:weekly:${weeklyPracticeId}`;
    return `practice-session:subject:${subjectId}:${questionSignature}`;
  }, [questions, homeworkId, weeklyPracticeId, subjectId]);

  // Handle Fullscreen changes (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Sync focus mode state with actual fullscreen state
      const isFullscreen = !!document.fullscreenElement;
      setIsFocusMode(isFullscreen);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // Also listen to webkit prefix for Safari
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFocusMode = async () => {
    if (!isFocusMode) {
      try {
        await document.documentElement.requestFullscreen();
        // State will be updated by fullscreenchange event
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
        // Fullscreen not supported or blocked, just toggle the focus UI
        setIsFocusMode(true);
      }
    } else {
      // Always reset focus mode state first
      setIsFocusMode(false);
      // Then exit fullscreen if we're in it
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.error("Error exiting fullscreen:", err);
        }
      }
    }
  };

  const currentQuestion = questions[currentIndex];
  const isChecked = checkedAnswers[currentQuestion.id];

  const isQuestionCorrect = (question: Question, userAnswer?: string) => {
    if (!userAnswer) return false;
    if (question.type === "coding_challenge") {
      return userAnswer.trim().length > 0;
    }
    return userAnswer === question.answer;
  };

  const getAnswerStats = (answerMap: Record<number, string>) => {
    let answeredCount = 0;
    let correctCount = 0;

    for (const q of questions) {
      const userAnswer = answerMap[q.id];
      if (!userAnswer) continue;
      answeredCount += 1;
      if (isQuestionCorrect(q, userAnswer)) {
        correctCount += 1;
      }
    }

    return { answeredCount, correctCount };
  };

  const savePartialProgress = async (answerMap: Record<number, string>) => {
    if (isGuest || (!homeworkId && !weeklyPracticeId)) return;

    const { answeredCount, correctCount } = getAnswerStats(answerMap);
    if (answeredCount === 0) return;

    try {
      if (homeworkId) {
        const { saveHomeworkProgress } = await import("@/app/homework/actions");
        await saveHomeworkProgress({
          homeworkId,
          answeredCount,
          correctCount,
          totalCount: questions.length,
          durationSeconds: elapsedTime,
          mode: homeworkMode,
        });
      }

      if (weeklyPracticeId) {
        const { saveWeeklyPracticeProgress } = await import(
          "@/app/weekly-practice/actions"
        );
        await saveWeeklyPracticeProgress({
          weeklyPracticeId,
          answeredCount,
          correctCount,
          totalCount: questions.length,
          durationSeconds: elapsedTime,
          mode: weeklyPracticeMode,
        });
      }
    } catch (error) {
      console.error("Failed to save partial progress:", error);
    }
  };

  const flushProgressSave = async () => {
    if (progressSaveTimeoutRef.current) {
      clearTimeout(progressSaveTimeoutRef.current);
      progressSaveTimeoutRef.current = null;
    }
    await savePartialProgress(answers);
  };

  const handleExitSession = async () => {
    await flushProgressSave();
    router.push(exitLink);
  };

  const handleResetSession = () => {
    if (
      window.confirm(
        "Are you sure you want to start over? Your progress in this session will be reset, but your answer history will be kept in the database.",
      )
    ) {
      sessionStorage.removeItem(sessionStorageKey);
      setCurrentIndex(0);
      setAnswers({});
      setCheckedAnswers({});
      setElapsedTime(0);
      setFinalScore(0);
    }
  };

  const handleRedoQuestion = () => {
    const questionId = currentQuestion.id;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setCheckedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  useEffect(() => {
    if (hasRestoredSessionRef.current) return;
    hasRestoredSessionRef.current = true;

    try {
      const raw = sessionStorage.getItem(sessionStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        currentIndex?: number;
        answers?: Record<string, unknown>;
        checkedAnswers?: Record<string, unknown>;
      };

      const validQuestionIds = new Set(questions.map((q) => String(q.id)));

      if (typeof parsed.currentIndex === "number") {
        const safeIndex = Math.min(
          Math.max(parsed.currentIndex, 0),
          questions.length - 1,
        );
        setCurrentIndex(safeIndex);
      }

      if (parsed.answers && typeof parsed.answers === "object") {
        const restoredAnswers = Object.fromEntries(
          Object.entries(parsed.answers).filter(
            ([questionId, value]) =>
              validQuestionIds.has(questionId) && typeof value === "string",
          ),
        ) as Record<number, string>;
        setAnswers(restoredAnswers);
      }

      if (parsed.checkedAnswers && typeof parsed.checkedAnswers === "object") {
        const restoredCheckedAnswers = Object.fromEntries(
          Object.entries(parsed.checkedAnswers).filter(
            ([questionId, value]) =>
              validQuestionIds.has(questionId) && typeof value === "boolean",
          ),
        ) as Record<number, boolean>;
        setCheckedAnswers(restoredCheckedAnswers);
      }
    } catch (error) {
      console.error("Failed to restore practice session progress:", error);
    } finally {
      isHydratingSessionRef.current = false;
    }
  }, [questions, sessionStorageKey]);

  useEffect(() => {
    if (isHydratingSessionRef.current) return;

    try {
      sessionStorage.setItem(
        sessionStorageKey,
        JSON.stringify({
          currentIndex,
          answers,
          checkedAnswers,
        }),
      );
    } catch (error) {
      console.error("Failed to persist practice session progress:", error);
    }
  }, [sessionStorageKey, currentIndex, answers, checkedAnswers]);

  useEffect(() => {
    if (isHydratingSessionRef.current) return;
    if (showResults || isSubmitting) return;
    if (isGuest || (!homeworkId && !weeklyPracticeId)) return;
    if (Object.keys(answers).length === 0) return;

    if (progressSaveTimeoutRef.current) {
      clearTimeout(progressSaveTimeoutRef.current);
    }

    progressSaveTimeoutRef.current = setTimeout(() => {
      void savePartialProgress(answers);
      progressSaveTimeoutRef.current = null;
    }, 700);
  }, [
    answers,
    showResults,
    isSubmitting,
    isGuest,
    homeworkId,
    weeklyPracticeId,
  ]);

  useEffect(() => {
    return () => {
      if (progressSaveTimeoutRef.current) {
        clearTimeout(progressSaveTimeoutRef.current);
        progressSaveTimeoutRef.current = null;
      }
    };
  }, []);

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("question_id")
        .eq("user_id", user.id)
        .in(
          "question_id",
          questions.map((q) => q.id),
        );

      if (data) {
        setBookmarks(new Set(data.map((b: any) => b.question_id)));
      }
    };
    fetchBookmarks();
  }, [questions, user.id]);

  // Fetch Topics
  useEffect(() => {
    const fetchTopics = async () => {
      if (!subjectId) return;
      const { data } = await supabase
        .from("topics")
        .select("id, name")
        .eq("subject_id", subjectId);

      if (data) {
        const topicMap: Record<number, string> = {};
        data.forEach((t: any) => (topicMap[t.id] = t.name));
        setTopics(topicMap);
      }
    };
    fetchTopics();
  }, [subjectId]);

  // Group questions by topic
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, number[]> = {};
    const topicOrder: string[] = [];

    questions.forEach((q, index) => {
      const topicName =
        q.topic_id && topics[q.topic_id] ? topics[q.topic_id] : "General";
      if (!groups[topicName]) {
        groups[topicName] = [];
        topicOrder.push(topicName);
      }
      groups[topicName].push(index);
    });

    // Move "General" to the end if it exists
    if (groups["General"]) {
      const generalIndex = topicOrder.indexOf("General");
      if (generalIndex > -1) {
        topicOrder.splice(generalIndex, 1);
        topicOrder.push("General");
      }
    }

    return { groups, topicOrder };
  }, [questions, topics]);

  // Initialize expanded topics (expand all by default)
  useEffect(() => {
    if (groupedQuestions.topicOrder.length > 0 && expandedTopics.size === 0) {
      setExpandedTopics(new Set(groupedQuestions.topicOrder));
    }
  }, [groupedQuestions.topicOrder]);

  const toggleTopic = (topic: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topic)) {
      newExpanded.delete(topic);
    } else {
      newExpanded.add(topic);
    }
    setExpandedTopics(newExpanded);
  };

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
      .maybeSingle();

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

    const isCorrect = isQuestionCorrect(currentQuestion, answer);

    // Record answer for progress tracking
    const { recordAnswer } = await import("@/lib/actions/recordAnswer");
    await recordAnswer(currentQuestion.id, answer, isCorrect, "practice");

    if (!isCorrect) {
      // Record mistake immediately
      const { data: existingData } = await supabase
        .from("mistakes")
        .select("error_count")
        .eq("user_id", user.id)
        .eq("question_id", currentQuestion.id)
        .maybeSingle();

      const existing = existingData as { error_count: number } | null;
      const newCount = (existing?.error_count || 0) + 1;

      const { error: upsertError } = await supabase.from("mistakes").upsert(
        {
          user_id: user.id,
          question_id: currentQuestion.id,
          error_count: newCount,
          error_type: "wrong_answer",
          last_wrong_answer: answer,
          last_error_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,question_id" },
      );

      if (upsertError) {
        console.error("Failed to record mistake:", upsertError);
      }
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
    if (progressSaveTimeoutRef.current) {
      clearTimeout(progressSaveTimeoutRef.current);
      progressSaveTimeoutRef.current = null;
    }

    setIsSubmitting(true);

    try {
      // Calculate correct count for results modal
      let correctCount = 0;
      for (const q of questions) {
        const userAnswer = answers[q.id];
        if (!userAnswer) continue;
        if (isQuestionCorrect(q, userAnswer)) correctCount++;
      }

      // Note: Answers are already recorded in handleCheck() via recordAnswer

      // Update last practice date
      await supabase
        .from("profiles")
        .update({
          last_practice_date: new Date().toISOString(),
        } as any)
        .eq("id", user.id);

      if (homeworkId) {
        const answeredCount = Object.keys(answers).length;
        try {
          const { submitHomework } = await import("@/app/homework/actions");
          await submitHomework({
            homeworkId,
            answeredCount,
            correctCount,
            totalCount: questions.length,
            durationSeconds: elapsedTime,
            mode: homeworkMode,
          });
        } catch (homeworkError) {
          console.error("Failed to submit homework:", homeworkError);
        }
      }

      if (weeklyPracticeId) {
        const answeredCount = Object.keys(answers).length;
        try {
          const { submitWeeklyPractice } =
            await import("@/app/weekly-practice/actions");
          await submitWeeklyPractice({
            weeklyPracticeId,
            answeredCount,
            correctCount,
            totalCount: questions.length,
            durationSeconds: elapsedTime,
            mode: weeklyPracticeMode,
          });
        } catch (weeklyError) {
          console.error("Failed to submit weekly practice:", weeklyError);
        }
      }

      // Show results modal
      sessionStorage.removeItem(sessionStorageKey);
      setFinalScore(correctCount);
      setShowResults(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting results:", error);
      setIsSubmitting(false);
    }
  };

  // Parse options safely
  const options = currentQuestion.options as unknown as QuestionOption[] | null;

  // Keyboard navigation is disabled - question switching should be fully user-controlled
  // Users can navigate using the question navigator or Next/Previous buttons only

  return (
    <div
      className={`flex-1 w-full max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 ${
        mode === "standalone" ? "items-center justify-center" : ""
      }`}
    >
      {/* Left Sidebar - Topic Navigation (Only in Practice Mode and NOT in Focus Mode) */}
      {mode === "practice" && !isFocusMode && showTopics && (
        <aside className="w-full lg:w-80 flex flex-col gap-0 shrink-0 order-2 lg:order-1 lg:sticky lg:top-8 lg:self-start font-serif h-[calc(100vh-6rem)]">
          <div className="bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-gray-800 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2 text-black dark:text-white">
                <Layout className="size-5" />
                Contents
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-sm bg-white dark:bg-slate-900">
                {questions.length} Qs
              </span>
            </div>

            {/* Scrollable Topic List */}
            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {groupedQuestions.topicOrder.map((topicName) => {
                const indices = groupedQuestions.groups[topicName];
                const isExpanded = expandedTopics.has(topicName);
                const isActiveTopic = indices.includes(currentIndex);
                const completedCount = indices.filter(
                  (i) => checkedAnswers[questions[i].id],
                ).length;

                return (
                  <div
                    key={topicName}
                    className={`border-b border-gray-200 dark:border-gray-800 last:border-b-0 ${
                      isActiveTopic ? "bg-gray-50 dark:bg-slate-800/50" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggleTopic(topicName)}
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex-1 pr-2">
                        <div
                          className={`font-bold text-sm tracking-wide mb-1 ${
                            isActiveTopic
                              ? "text-black dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {topicName}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span>
                            {completedCount}/{indices.length} done
                          </span>
                          <div className="h-1 w-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-900 dark:bg-gray-200 transition-all duration-300"
                              style={{
                                width: `${
                                  (completedCount / indices.length) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown className="size-4" />
                      </div>
                    </button>

                    {/* Questions Grid */}
                    {isExpanded && (
                      <div className="p-4 pt-0 grid grid-cols-5 gap-2 animate-in slide-in-from-top-2 duration-200">
                        {indices.map((idx) => {
                          const q = questions[idx];
                          const isCurrent = idx === currentIndex;
                          const wasChecked = checkedAnswers[q.id];
                          const isAnswered = !!answers[q.id];
                          const isCorrect =
                            wasChecked && isQuestionCorrect(q, answers[q.id]);

                          let btnClass =
                            "bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500";

                          if (isCurrent) {
                            btnClass =
                              "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100 ring-2 ring-offset-1 ring-gray-900 dark:ring-gray-100 dark:ring-offset-slate-900 z-10";
                          } else if (wasChecked) {
                            btnClass = isCorrect
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
                          } else if (isAnswered) {
                            btnClass =
                              "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600";
                          }

                          return (
                            <button
                              key={q.id}
                              onClick={() => {
                                setCurrentIndex(idx);
                                // Scroll question into view if needed? No, user action handles navigation
                              }}
                              className={`aspect-square rounded-md border text-xs font-bold flex items-center justify-center transition-all duration-200 ${btnClass}`}
                              title={`Question ${idx + 1}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-serif font-bold rounded-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                onClick={handleResetSession}
              >
                <RotateCcw className="mr-2 size-4" />
                Reset
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 font-serif font-bold rounded-sm border border-transparent hover:border-red-200"
                onClick={handleExitSession}
              >
                <LogOut className="mr-2 size-4" />
                Exit Session
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
              ? "w-full max-w-5xl mx-auto transition-[width,margin] duration-500"
              : ""
        }`}
      >
        <div className="bg-white dark:bg-slate-900 shadow-none border-2 border-gray-200 dark:border-gray-800 min-h-[800px] p-8 lg:p-16 relative flex flex-col font-serif">
          {/* Exam Header */}
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-black dark:border-white pb-4 mb-12 text-black dark:text-white font-serif">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {questions[currentIndex].topic_id &&
                topics[questions[currentIndex].topic_id]
                  ? topics[questions[currentIndex].topic_id]
                  : "General Question"}
              </h2>
              <p className="text-sm text-gray-500">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mode === "practice" && enableTimer && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-sm text-xs font-serif bg-white dark:bg-slate-900">
                  <Timer className="size-3.5" />
                  <span className="font-mono">{formatTime(elapsedTime)}</span>
                </div>
              )}
              {mode === "practice" && (!showTopics || isFocusMode) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 font-serif font-bold"
                  onClick={handleExitSession}
                >
                  <LogOut className="mr-2 size-4" />
                  Exit Session
                </Button>
              )}
            </div>
          </div>

          {/* Controls Overlay (Focus Mode etc) */}
          <div className="absolute top-4 right-4 flex items-center gap-4 print:hidden">
            <div
              className={`flex items-center gap-4 transition-opacity duration-300 ${
                isFocusMode ? "opacity-30 hover:opacity-100" : "opacity-100"
              }`}
            >
              {/* Focus Mode Toggle */}
              <button
                onClick={toggleFocusMode}
                className="p-2 rounded-full transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-300"
                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                aria-label={
                  isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"
                }
              >
                {isFocusMode ? (
                  <Minimize2 className="size-5" />
                ) : (
                  <Maximize2 className="size-5" />
                )}
              </button>

              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  bookmarks.has(currentQuestion.id)
                    ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
                aria-label={
                  bookmarks.has(currentQuestion.id)
                    ? "Remove bookmark"
                    : "Bookmark question"
                }
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
                className="p-2 rounded-full transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600 relative group"
                title="Add to Mistakes"
                aria-label={
                  addedMistake ? "Remove from mistakes" : "Add to Mistakes"
                }
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

              {/* Report issue button is temporarily hidden */}
              {/*
              <FeedbackButton
                questionId={currentQuestion.id}
                userId={user.id}
              />
              */}
            </div>
          </div>

          {/* Question Content & Feedback Layout - Now Vertical Column */}
          <div className="flex flex-col gap-12">
            <div className="w-full">
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
                                className={`relative inline-flex items-center justify-center w-10 h-10 mt-0.5 font-serif font-medium text-lg ${
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
                                <span className="relative z-10">
                                  {optionLabel}
                                </span>
                                {/* Pen Circle Animation for Selected Option */}
                                {isSelected && !isChecked && (
                                  <PenCircle className="text-blue-600 dark:text-blue-400 -inset-1" />
                                )}
                              </span>
                              <div
                                className={`flex-1 font-serif text-lg leading-relaxed z-10 ${
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
                        },
                      )}
                    </div>
                  ) : currentQuestion.type === "coding_challenge" ? (
                    /* Coding Challenge - 静态代码展示，文本输入作答 */
                    <div className="relative">
                      <div className="absolute -left-6 top-8 bottom-8 w-0.5 bg-red-300/30 hidden lg:block" />
                      <textarea
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => handleAnswer(e.target.value)}
                        disabled={isChecked}
                        placeholder="在此输入你的答案..."
                        className="w-full min-h-[200px] p-0 bg-[repeating-linear-gradient(transparent,transparent_31px,#000000_32px)] text-lg leading-8 font-serif text-black dark:text-gray-100 border-none focus:ring-0 resize-y placeholder:text-gray-300 dark:placeholder:text-gray-700 bg-transparent translate-y-[6px]"
                        style={{
                          lineHeight: "32px",
                          backgroundAttachment: "local",
                          backgroundSize: "100% 32px",
                        }}
                      />
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

            {/* Feedback Section - Moved Below */}
            {isChecked &&
              (() => {
                const isCorrectAnswer =
                  isQuestionCorrect(
                    currentQuestion,
                    answers[currentQuestion.id],
                  );
                return (
                  <div
                    className={`w-full p-8 border-t-2 border-dashed ${
                      isCorrectAnswer
                        ? "bg-green-50/50 border-green-200 text-green-900 dark:bg-green-900/10 dark:border-green-800 dark:text-green-200"
                        : "bg-red-50/50 border-red-200 text-red-900 dark:bg-red-900/10 dark:border-red-800 dark:text-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {isCorrectAnswer ? (
                        <Lightbulb className="size-6 shrink-0 mt-1" />
                      ) : (
                        <Info className="size-6 shrink-0 mt-1" />
                      )}
                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="font-serif font-bold text-xl mb-2">
                            {isCorrectAnswer ? "Correct" : "Incorrect"}
                          </p>
                          <p className="font-serif text-lg leading-relaxed opacity-90">
                            {currentQuestion.explanation ||
                              (currentQuestion.type === "coding_challenge"
                                ? "请完成作答后提交。"
                                : "No explanation provided.")}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-current/10 w-full">
                          <p className="text-sm opacity-80">
                            Review the explanation, then try a similar question
                            to reinforce the concept.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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

          <div className="flex items-center gap-3">
            {!isChecked ? (
              <Button
                onClick={() => handleCheck()}
                disabled={!answers[currentQuestion.id]}
                className="px-8 bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black rounded-full shadow-lg transition-[background-color,box-shadow,transform,color] active:scale-95 group gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
                <span className="text-xs px-1.5 py-0.5 rounded border border-white/20 bg-white/10 text-white/80 group-hover:text-white transition-colors">
                  ✓
                </span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleRedoQuestion}
                  variant="outline"
                  className="px-6 rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Redo
                </Button>
                <Button
                  onClick={handleNext}
                  className="px-8 bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black rounded-full shadow-lg transition-[background-color,box-shadow,transform,color] active:scale-95 group gap-2"
                >
                  {currentIndex === questions.length - 1
                    ? "Finish Exam"
                    : "Next Question"}
                  <span className="text-xs px-1.5 py-0.5 rounded border border-white/20 bg-white/10 text-white/80 group-hover:text-white transition-colors">
                    ↓
                  </span>
                </Button>
              </>
            )}
          </div>
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
            sessionStorage.removeItem(sessionStorageKey);
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
