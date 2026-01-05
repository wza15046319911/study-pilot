"use client";

import Link from "next/link";
import { QuestionBankItem } from "@/components/question-bank/QuestionBankItem";
import { BookOpen, GraduationCap, ChevronRight, Layers } from "lucide-react";

interface LibraryContentProps {
  subjects: any[];
  groupedBanks: Record<string, any[]>;
  groupedExams: Record<string, any[]>;
  isVip: boolean;
  unlockedBankIds: Set<number>;
}

import { useRouter } from "next/navigation";

export function LibraryContent({
  subjects,
  groupedBanks,
  groupedExams,
  isVip,
  unlockedBankIds,
}: LibraryContentProps) {
  const router = useRouter();
  return (
    <div className="space-y-16">
      {subjects.map((subject) => {
        const banks = groupedBanks[subject.id] || [];
        const exams = groupedExams[subject.id] || [];

        // If nothing exists for this subject, maybe skip or show empty? 
        // Showing standard practice is always an option.
        
        return (
          <div key={subject.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {subject.icon && <span className="text-3xl">{subject.icon}</span>}
                {subject.name}
              </h2>
            </div>
            
            {/* Section 1: Quick Practice */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                Quick Practice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <QuestionBankItem
                  key="practice-all"
                  isVip={true} 
                  questionCount={0}
                  variant="practice"
                  titleOverride="Practice All"
                  subtitleOverride={`Access the complete question pool for ${subject.name}.`}
                  bank={{ slug: subject.slug }}
                  onClickOverride={() => {
                     router.push(`/practice/${subject.slug}/setup`);
                  }}
                  isUnlocked={true}
                />
              </div>
            </div>

            {/* Section 2: Mock Exams */}
            {exams.length > 0 && (
              <div className="mb-8">
                 <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                   Mock Exams
                 </h3>
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
                          router.push(`/exams/${exam.slug}`);
                       }}
                     />
                   ))}
                 </div>
              </div>
            )}

            {/* Section 3: Question Banks */}
            {banks.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Curated Collections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {banks.map((bank: any) => (
                    <QuestionBankItem
                      key={bank.id}
                      bank={bank}
                      isVip={isVip}
                      isUnlocked={unlockedBankIds.has(bank.id)}
                      questionCount={bank.items?.[0]?.count || 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {subjects.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            No subjects found.
          </p>
        </div>
      )}
    </div>
  );
}
