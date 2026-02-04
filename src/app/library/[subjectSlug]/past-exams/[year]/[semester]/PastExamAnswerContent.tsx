import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LatexContent } from "@/components/ui/LatexContent";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Archive, ChevronRight, ClipboardCheck } from "lucide-react";

interface PastExamQuestion {
  id: number;
  order_index: number;
  question_type: string;
  content: string | null;
  answer: string;
  explanation: string | null;
}

interface PastExamAnswerContentProps {
  user: { username: string; avatar_url?: string; is_vip?: boolean };
  subject: { name: string; slug: string; icon?: string | null };
  exam: { year: number; semester: number; title: string | null };
  questions: PastExamQuestion[];
  typeCounts: { type: string; count: number }[];
}

const getSemesterLabel = (semester: number) =>
  semester === 1 ? "上学期" : "下学期";

const formatTypeLabel = (type: string) =>
  type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function PastExamAnswerContent({
  user,
  subject,
  exam,
  questions,
  typeCounts,
}: PastExamAnswerContentProps) {
  const semesterLabel = getSemesterLabel(exam.semester);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-950">
      <AmbientBackground />
      <Header user={user} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-10">
          <Link href="/library" className="hover:text-blue-600 transition-colors">
            Library
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href={`/library/${subject.slug}`}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            {subject.icon && <span>{subject.icon}</span>}
            {subject.name}
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-slate-900 dark:text-white font-medium">
            {exam.year} {semesterLabel}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6">
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
                  <Archive className="size-4" />
                  Past Exam
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  Answer Key
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                {subject.name}
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
                {exam.year} {semesterLabel}
              </p>
              {exam.title && (
                <p className="text-sm text-slate-500 mt-3">{exam.title}</p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {questions.length}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Questions
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {typeCounts.length}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Types
                  </div>
                </div>
              </div>
            </GlassPanel>

            {typeCounts.length > 0 && (
              <GlassPanel className="p-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <ClipboardCheck className="size-4" />
                  Question Types
                </h3>
                <div className="space-y-2">
                  {typeCounts.map((entry) => (
                    <div
                      key={entry.type}
                      className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300"
                    >
                      <span>{formatTypeLabel(entry.type)}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            {questions.map((question, index) => {
              const isCode = question.question_type === "code_output";
              return (
                <GlassPanel
                  key={question.id}
                  className="p-6"
                  style={{ contentVisibility: "auto" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-amber-500 font-semibold">
                        Q{index + 1}
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatTypeLabel(question.question_type)}
                      </div>
                    </div>
                  </div>

                  {question.content && (
                    <div className="mb-6">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Question
                      </div>
                      {isCode ? (
                        <CodeBlock code={question.content} language="python" />
                      ) : (
                        <LatexContent className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                          {question.content}
                        </LatexContent>
                      )}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-2">
                      Answer
                    </div>
                    {isCode ? (
                      <CodeBlock code={question.answer} language="plaintext" />
                    ) : (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 p-4 font-mono text-sm text-emerald-900 dark:text-emerald-100 whitespace-pre-wrap">
                        {question.answer}
                      </div>
                    )}
                  </div>

                  {question.explanation && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-2">
                        Explanation
                      </div>
                      <div className="rounded-xl bg-amber-50/70 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 p-4 text-slate-700 dark:text-slate-300">
                        <LatexContent className="whitespace-pre-wrap">
                          {question.explanation}
                        </LatexContent>
                      </div>
                    </div>
                  )}
                </GlassPanel>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
