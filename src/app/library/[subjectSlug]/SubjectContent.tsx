"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionBankItem } from "@/components/question-bank/QuestionBankItem";
import { PremiumModal } from "@/components/ui/PremiumModal";
import {
  Play,
  Settings2,
  Lock,
  Layers,
  GraduationCap,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface SubjectContentProps {
  subject: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  };
  exams: any[];
  banks: any[];
  isVip: boolean;
  unlockedBankIds: Set<number>;
  questionCount: number;
}

export function SubjectContent({
  subject,
  exams,
  banks,
  isVip,
  unlockedBankIds,
  questionCount,
}: SubjectContentProps) {
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleSetupClick = (e: React.MouseEvent) => {
    if (!isVip) {
      e.preventDefault();
      setShowPremiumModal(true);
    }
  };

  return (
    <div className="py-12 space-y-24">
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Unlock Custom Practice"
        description="Configure your perfect practice session by choosing specific topics, difficulties, and question counts with StudyPilot Premium."
      />

      {/* 1. Hero Section */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-6">
          <div className="size-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 text-6xl">
            {subject.icon}
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {subject.name}
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light max-w-2xl">
              Explore practice materials, mock exams, and curated question
              banks.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Practice Zone */}
      <section className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Play className="size-6 text-blue-600 dark:text-blue-400" />
            Practice Zone
          </h2>
          <span className="hidden md:inline-block text-sm text-slate-500">
            Start solving problems to master your skills.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* A. Quick Practice */}
          <Link
            href={`/library/${subject.slug}/practice`}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Play className="size-6 ml-1" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Quick Practice
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Jump straight into a session with 10 random questions. Best for
              daily consistency.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:gap-2 transition-all">
              Start Session <ChevronRight className="size-4" />
            </div>
          </Link>

          {/* B. Immersive Mode */}
          <Link
            href={`/library/${subject.slug}/immersive`}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Layers className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Immersive
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Distraction-free, infinite flow of questions. Focus purely on
              problem solving.
            </p>
            <div className="flex items-center text-purple-600 dark:text-purple-400 font-bold text-sm group-hover:gap-2 transition-all">
              Enter Flow <ChevronRight className="size-4" />
            </div>
          </Link>

          {/* C. Configure (Premium) */}
          <Link
            href={isVip ? `/library/${subject.slug}/setup` : "#"}
            onClick={handleSetupClick}
            className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
          >
            {/* Premium Indicator if locked */}
            {!isVip && (
              <div className="absolute top-4 right-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Lock className="size-4 text-slate-400" />
                </div>
              </div>
            )}

            <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Settings2 className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Custom Setup
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Create a tailored exam with specific topics, difficulty levels,
              and timing.
            </p>
            <div
              className={`flex items-center ${
                isVip
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              } font-bold text-sm group-hover:gap-2 transition-all`}
            >
              {isVip ? "Configure" : "Premium Only"}{" "}
              <ChevronRight className="size-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Study Materials (Split Layout) */}
      <section className="max-w-6xl mx-auto space-y-16">
        {/* Mock Exams */}
        {exams.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <GraduationCap className="size-6 text-indigo-600 dark:text-indigo-400" />
                Mock Exams
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {exams.map((exam: any) => (
                <QuestionBankItem
                  key={exam.id}
                  bank={exam}
                  isVip={isVip}
                  questionCount={0}
                  variant="exam"
                  isUnlocked={true}
                  onClickOverride={() => {
                    router.push(`/library/${subject.slug}/exams/${exam.slug}`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Question Banks */}
        {banks.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <BookOpen className="size-6 text-amber-600 dark:text-amber-400" />
                Curated Collections
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {banks.map((bank: any) => (
                <QuestionBankItem
                  key={bank.id}
                  bank={bank}
                  isVip={isVip}
                  isUnlocked={unlockedBankIds.has(bank.id)}
                  questionCount={bank.items?.[0]?.count || 0}
                  onClickOverride={() => {
                    router.push(
                      `/library/${subject.slug}/question-banks/${bank.slug}`
                    );
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Empty State */}
      {exams.length === 0 && banks.length === 0 && (
        <div className="max-w-md mx-auto text-center py-20 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <BookOpen className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            No Content Yet
          </h3>
          <p className="text-slate-500">
            We're still adding materials for this subject. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
