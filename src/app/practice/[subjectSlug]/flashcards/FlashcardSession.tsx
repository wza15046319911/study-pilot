"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Question, Profile, FlashcardReview } from "@/types/database";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  Check,
  Zap,
  Timer,
  Award,
} from "lucide-react";
import { encodeId } from "@/lib/ids";
import { getNextReviewIntervals, SRSItem } from "@/lib/srs";
import { saveFlashcardReview } from "@/app/practice/actions";

type ExtendedQuestion = Question & { review: FlashcardReview | null };

interface FlashcardSessionProps {
  questions: ExtendedQuestion[];
  user: Profile;
  subjectId: number;
  subjectName: string;
}

export default function FlashcardSession({
  questions,
  user,
  subjectId,
  subjectName,
}: FlashcardSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const [isFlipped, setIsFlipped] = useState(false);

  // State for current card review settings
  const currentInterval = currentQuestion.review?.interval_days || 0;
  const currentEase = currentQuestion.review?.ease_factor || 2.5;
  const currentRepetitions = currentQuestion.review?.repetitions || 0;

  const nextIntervals = getNextReviewIntervals({
    intervalDays: currentInterval,
    easeFactor: currentEase,
    repetitions: currentRepetitions,
  });

  const handleRate = async (quality: 0 | 3 | 4 | 5) => {
    // 1. Record the answer for progress tracking
    const { recordAnswer } = await import("@/lib/actions/recordAnswer");
    await recordAnswer(
      currentQuestion.id,
      quality >= 3 ? "correct" : "incorrect", // Simplified answer text
      quality >= 3, // isCorrect: quality 3+ means pass
      "flashcard"
    );

    // 2. Save SRS review to DB
    await saveFlashcardReview(
      currentQuestion.id,
      quality,
      currentInterval,
      currentEase,
      currentRepetitions
    );

    // 3. Move to next card
    handleNext();
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300);
    } else {
      // End of session
      alert("Session Complete!");
      router.push(`/practice/${encodeId(subjectId)}/setup`);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 300);
    }
  };

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  const formatInterval = (days: number) => {
    if (days < 1) return "<1d";
    return `${Math.round(days)}d`;
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              router.push(`/practice/${encodeId(subjectId)}/setup`)
            }
          >
            <ChevronLeft className="size-4 mr-1" />
            Exit
          </Button>
          <div>
            <h1 className="font-bold text-lg">{subjectName} Flashcards</h1>
            <p className="text-sm text-[#4c669a]">
              Card {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
          <Zap className="size-4" />
          SRS Mode
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8">
        <div
          className="h-full bg-[#135bec] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard Area */}
      <div className="flex-1 flex items-center justify-center perspective-1000 mb-8">
        <div
          className={`relative w-full max-w-2xl aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of Card (Question) */}
          <div className="absolute inset-0 backface-hidden">
            <GlassPanel className="w-full h-full p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 border-transparent hover:border-blue-200 transition-colors">
              <span className="text-xs font-bold text-[#4c669a] uppercase tracking-wider mb-4">
                Question
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0d121b] dark:text-white leading-relaxed">
                {currentQuestion.title}
              </h2>
              {currentQuestion.content && (
                <p className="mt-4 text-[#4c669a] line-clamp-4">
                  {currentQuestion.content}
                </p>
              )}
              <div className="absolute bottom-6 text-sm text-[#4c669a] flex items-center gap-2 animate-pulse">
                <RotateCw className="size-4" />
                Click to flip
              </div>
            </GlassPanel>
          </div>

          {/* Back of Card (Answer) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <GlassPanel className="w-full h-full p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 border-green-100 bg-green-50/50 dark:bg-green-900/10">
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider mb-4">
                Answer
              </span>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-xl md:text-2xl font-medium text-[#0d121b] dark:text-white">
                  {currentQuestion.answer}
                </p>
                {currentQuestion.explanation && (
                  <p className="mt-4 text-base text-[#4c669a]">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {!isFlipped ? (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="w-full max-w-xs h-14 text-lg font-medium shadow-lg shadow-blue-500/20 bg-[#135bec] hover:bg-blue-600 text-white"
              onClick={() => setIsFlipped(true)}
            >
              Show Answer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto w-full">
            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/30 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation();
                handleRate(0);
              }}
            >
              <span className="font-bold">Again</span>
              <span className="text-xs opacity-70">
                {formatInterval(nextIntervals.again.intervalDays)}
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 dark:border-orange-900/30 dark:hover:bg-orange-900/20"
              onClick={(e) => {
                e.stopPropagation();
                handleRate(3);
              }}
            >
              <span className="font-bold">Hard</span>
              <span className="text-xs opacity-70">
                {formatInterval(nextIntervals.hard.intervalDays)}
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-900/30 dark:hover:bg-blue-900/20"
              onClick={(e) => {
                e.stopPropagation();
                handleRate(4);
              }}
            >
              <span className="font-bold">Good</span>
              <span className="text-xs opacity-70">
                {formatInterval(nextIntervals.good.intervalDays)}
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 dark:border-green-900/30 dark:hover:bg-green-900/20"
              onClick={(e) => {
                e.stopPropagation();
                handleRate(5);
              }}
            >
              <span className="font-bold">Easy</span>
              <span className="text-xs opacity-70">
                {formatInterval(nextIntervals.easy.intervalDays)}
              </span>
            </Button>
          </div>
        )}

        <div className="flex justify-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={currentIndex === 0}
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous Card
          </Button>
        </div>
      </div>

      {/* CSS for 3D Flip */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
