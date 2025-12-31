"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Question, Profile } from "@/types/database";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  Check,
  Zap,
} from "lucide-react";
import { encodeId } from "@/lib/ids";

interface FlashcardSessionProps {
  questions: Question[];
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
  const [isFlipped, setIsFlipped] = useState(false);

  // Simple state to track "mastered" cards purely for this session (optional gamification)
  const [masteredCount, setMasteredCount] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 300); // Wait for flip back
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 300);
    }
  };

  const handleMarkMastered = () => {
    setMasteredCount((prev) => prev + 1);
    handleNext();
  };

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <Check className="size-4" />
          {masteredCount} Mastered
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
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="secondary"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          disabled={currentIndex === 0}
          className="w-32"
        >
          <ChevronLeft className="size-5 mr-1" />
          Prev
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-32 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
          >
            <X className="size-5 mr-2" />
            Hard
          </Button>
          <Button
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkMastered();
            }}
            className="w-32 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25"
          >
            <Check className="size-5 mr-2" />
            Easy
          </Button>
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          disabled={currentIndex === questions.length - 1}
          className="w-32"
        >
          Next
          <ChevronRight className="size-5 ml-1" />
        </Button>
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
