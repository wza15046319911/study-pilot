"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionBankItem } from "@/components/question-bank/QuestionBankItem";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { GlareCard } from "@/components/aceternity/glare-card";
import Link from "next/link";
import {
  Play,
  Settings2,
  Lock,
  Layers,
  GraduationCap,
  BookOpen,
  ChevronRight,
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

  const handleSetupClick = () => {
    if (!isVip) {
      setShowPremiumModal(true);
    } else {
        router.push(`/library/${subject.slug}/setup`);
    }
  };

  const practiceCards = [
    {
      title: "Quick Practice",
      icon: <Play className="size-16 text-blue-600 dark:text-blue-400" />,
      href: `/library/${subject.slug}/practice`,
    },
    {
      title: "Immersive Mode",
      icon: <Layers className="size-16 text-purple-600 dark:text-purple-400" />,
      href: `/library/${subject.slug}/immersive`,
    },
    // {
    //   title: isVip ? "Custom Setup" : "Custom Setup (Premium)",
    //   icon: isVip ? (
    //     <Settings2 className="size-16 text-emerald-600 dark:text-emerald-400" />
    //   ) : (
    //     <Lock className="size-16 text-slate-400" />
    //   ),
    //   onClick: handleSetupClick,
    //   // Only provide href if VIP, otherwise onClick handles modal
    //   href: isVip ? `/library/${subject.slug}/setup` : undefined, 
    // },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {practiceCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <GlareCard className="h-full cursor-pointer p-8 hover:shadow-xl transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                    {card.title === "Quick Practice"
                      ? "Jump straight into a session with 10 random questions. Best for daily consistency."
                      : "Distraction-free, infinite flow of questions. Focus purely on problem solving."}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:gap-2 transition-all">
                    {card.title === "Quick Practice" ? "Start Session" : "Enter Flow"}{" "}
                    <ChevronRight className="size-4 ml-2" />
                  </div>
                </div>
              </GlareCard>
            </Link>
          ))}
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
