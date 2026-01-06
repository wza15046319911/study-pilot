"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuestionBankItem } from "@/components/question-bank/QuestionBankItem";
import { PremiumModal } from "@/components/ui/PremiumModal";
import {
  BookOpen,
  GraduationCap,
  Layers,
  Play,
  Settings2,
  Lock,
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
    <div className="space-y-12">
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Unlock Custom Practice"
        description="Configure your perfect practice session by choosing specific topics, difficulties, and question counts with StudyPilot Premium."
      />

      {/* Practice All Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-emerald-500 rounded-full" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Play className="size-5" />
            Practice All
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Setup Card */}
          <Link
            href={isVip ? `/library/${subject.slug}/setup` : "#"}
            onClick={handleSetupClick}
            className={`group relative rounded-2xl p-6 text-white overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
              isVip
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-xl hover:shadow-emerald-500/20"
                : "bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
            }`}
          >
            {isVip ? (
              /* VIP Content */
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
                <div className="relative z-10">
                  <Settings2 className="size-10 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">Configure Practice</h3>
                  <p className="text-emerald-100 text-sm mb-4">
                    Choose topics, difficulty, and question count for a
                    customized practice session.
                  </p>
                  <div className="text-sm font-medium bg-white/20 rounded-full px-3 py-1 inline-block">
                    {questionCount} questions available
                  </div>
                </div>
              </>
            ) : (
              /* Locked Content */
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
                <div className="absolute inset-0 bg-white/50 dark:bg-black/20" />{" "}
                {/* Subtle overlay */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Lock className="size-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                    Practice ALL
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
                    Get access to ALL questions in this subject
                  </p>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    Premium Only
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Quick Practice Card */}
          <Link
            href={`/library/${subject.slug}/practice`}
            className="group relative bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Play className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Quick Practice
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Jump into 10 random questions immediately.
            </p>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              Start now →
            </span>
          </Link>

          {/* Immersive Mode Card */}
          <Link
            href={`/library/${subject.slug}/immersive`}
            className="group relative bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Layers className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Immersive Mode
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              One question at a time, infinite stream of practice.
            </p>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:underline">
              Enter immersive →
            </span>
          </Link>
        </div>
      </section>

      {/* Mock Exams Section */}
      {exams.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="size-5" />
              Mock Exams
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({exams.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </section>
      )}

      {/* Question Banks Section */}
      {banks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-purple-500 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="size-5" />
              Question Banks
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({banks.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </section>
      )}

      {/* Empty State */}
      {exams.length === 0 && banks.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p>No mock exams or question banks available for this subject yet.</p>
          <p className="mt-2 text-sm">Use "Practice All" to start studying!</p>
        </div>
      )}
    </div>
  );
}
