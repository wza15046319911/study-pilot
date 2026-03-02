import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  FileText,
  MessageSquare,
  PhoneCall,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

const typeLabels: Record<string, string> = {
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  fill_blank: "Fill in Blank",
  code_output: "Code Output",
  handwrite: "Handwrite",
  true_false: "True/False",
};

export default async function PastExamAnswersPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/library/${subjectSlug}/past-exams`);
  }

  if (!subjectSlug) {
    redirect("/library");
  }

  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id, name, slug, icon")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as
    | { id: number; name: string; slug: string; icon?: string }
    | null;

  if (!subject) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Subject Not Found"
            description="The subject you're looking for doesn't exist."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  const profilePromise = supabase
    .from("profiles")
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const papersPromise = (supabase.from("past_exam_papers") as any)
    .select(
      `
      id,
      year,
      semester,
      questions:past_exam_questions(
        id,
        order_index,
        content,
        type,
        options,
        answer,
        explanation,
        code_snippet
      )
    `
    )
    .eq("subject_id", subject.id)
    .eq("is_published", true)
    .order("year", { ascending: false })
    .order("semester", { ascending: false })
    .order("order_index", { ascending: true, foreignTable: "past_exam_questions" });

  const [profileResult, papersResult] = await Promise.all([
    profilePromise,
    papersPromise,
  ]);

  const profile = profileResult.data as
    | { username?: string; avatar_url?: string; is_vip?: boolean }
    | null;

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  const papers = ((papersResult.data as any[]) || []).map((paper) => ({
    ...paper,
    questions: (paper.questions || []).sort(
      (a: any, b: any) => a.order_index - b.order_index
    ),
  }));

  const papersByYear = papers.reduce((acc, paper) => {
    const yearKey = String(paper.year);
    if (!acc[yearKey]) acc[yearKey] = [];
    acc[yearKey].push(paper);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedYears = Object.keys(papersByYear).sort(
    (a, b) => Number(b) - Number(a)
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
          <Link
            href={`/library/${subject.slug}`}
            className="inline-flex items-center gap-2 hover:text-slate-700"
          >
            <ArrowLeft className="size-4" /> Back to {subject.name}
          </Link>
        </div>

        <section className="mb-10">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-4xl">
              {subject.icon || "📘"}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-500 font-semibold">
                Past Exam Answers
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                {subject.name} Answer Archive
              </h1>
              <p className="text-slate-500 mt-2 max-w-2xl">
                Verified past paper answers organized by semester. Use these as a
                benchmark while revising and checking solutions.
              </p>
            </div>
          </div>
        </section>

        {papers.length === 0 ? (
          <GlassPanel className="p-10 text-center">
            <FileText className="size-14 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">
              No past exam answers yet
            </h2>
            <p className="text-slate-500">
              Check back soon for official answer releases.
            </p>
          </GlassPanel>
        ) : (
          <div className="space-y-12">
            {sortedYears.map((year) => (
              <section key={year} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Calendar className="size-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {year}
                  </h2>
                </div>

                <div className="space-y-4">
                  {papersByYear[year]
                    .sort((a: { semester: string }, b: { semester: string }) =>
                      a.semester.localeCompare(b.semester)
                    )
                    .map((paper: { id: number; semester: string; questions: unknown[] }) => (
                      <details
                        key={`${paper.id}-${paper.semester}`}
                        className="group rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm p-6"
                      >
                        <summary className="flex cursor-pointer items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold">
                              {paper.semester}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {paper.semester} Paper Answers
                              </h3>
                              <p className="text-sm text-slate-500">
                                {paper.questions.length} questions
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="size-4" /> Answer Key
                          </span>
                        </summary>

                        <div className="pt-6 space-y-6">
                          {paper.questions.map((question: any, index: number) => {
                            const isChoiceType =
                              question.type === "single_choice" ||
                              question.type === "multiple_choice";
                            const answers = question.answer
                              ? question.answer
                                  .split(",")
                                  .map((val: string) => val.trim().toUpperCase())
                              : [];

                            return (
                              <div
                                key={question.id}
                                className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-950 p-6 space-y-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                    Q{index + 1}
                                  </span>
                                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full">
                                    {typeLabels[question.type] || question.type}
                                  </span>
                                </div>

                                <div className="text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                  {question.content}
                                </div>

                                {question.code_snippet && (
                                  <pre className="text-sm font-mono bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto">
                                    {question.code_snippet}
                                  </pre>
                                )}

                                {isChoiceType && question.options?.length ? (
                                  <div className="grid gap-3">
                                    {question.options.map((opt: any) => {
                                      const isCorrect = answers.includes(
                                        String(opt.label || "").toUpperCase()
                                      );
                                      return (
                                        <div
                                          key={opt.label}
                                          className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                                            isCorrect
                                              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20"
                                              : "border-slate-200 dark:border-slate-800"
                                          }`}
                                        >
                                          <span
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                                              isCorrect
                                                ? "bg-emerald-600 text-white"
                                                : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                            }`}
                                          >
                                            {opt.label}
                                          </span>
                                          <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                            {opt.content}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/20 p-4">
                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest mb-2">
                                      Answer
                                    </p>
                                    <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                                      {question.answer}
                                    </p>
                                  </div>
                                )}

                                {question.explanation && (
                                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 p-4">
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-widest mb-2">
                                      Explanation
                                    </p>
                                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                                      {question.explanation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          <div className="rounded-2xl border border-blue-200/60 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 to-white/80 dark:from-blue-900/20 dark:to-slate-900/60 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                                <MessageSquare className="size-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  对某个题目有疑问？
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  点击右下角浮动按钮加微信，或联系我们获取解析支持。
                                </p>
                              </div>
                            </div>
                            <Link
                              href="/contact"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                            >
                              <PhoneCall className="size-4" />
                              Contact Us
                            </Link>
                          </div>
                        </div>
                      </details>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-12 flex items-center gap-2 text-sm text-slate-500">
          <BookOpen className="size-4" />
          Need practice? Head back to mock exams and question banks.
        </div>
      </main>
    </div>
  );
}
