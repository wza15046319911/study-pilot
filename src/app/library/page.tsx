import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { redirect } from "next/navigation";
import { SubjectGrid } from "./SubjectGrid";

export const metadata = {
  title: "Library | StudyPilot",
  description: "Your complete learning resource library.",
};

export default async function LibraryPage() {
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Profile
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  // 3. Fetch Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("id");

  // 4. Fetch Question Bank Counts per Subject
  const { data: banks } = await (supabase.from("question_banks") as any)
    .select("subject_id")
    .eq("is_published", true);

  const bankCounts = (banks || []).reduce(
    (acc: Record<number, number>, bank: any) => {
      acc[bank.subject_id] = (acc[bank.subject_id] || 0) + 1;
      return acc;
    },
    {}
  );

  // 5. Fetch Exam Counts per Subject
  const { data: exams } = await supabase
    .from("exams")
    .select("subject_id")
    .eq("is_published", true);

  const examCounts = (exams || []).reduce(
    (acc: Record<number, number>, exam: any) => {
      acc[exam.subject_id] = (acc[exam.subject_id] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
        {/* Academic Hero Section */}
        <div className="max-w-4xl mx-auto mb-20 text-center">
          <div className="inline-block mb-4">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800">
              Academic Year 2026
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-900 dark:text-white mb-6 tracking-tight">
            Library
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light max-w-2xl mx-auto mb-10">
            Access your complete catalog of course materials, including curated
            question banks, mock exams, and intelligent study tools.
          </p>

          {/* Quick Stats Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-12 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl px-8 py-4 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                {subjects?.length || 0}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Subjects
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                25k+
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Questions
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                Active
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Status
              </div>
            </div>
          </div>
        </div>

        <SubjectGrid
          subjects={subjects || []}
          bankCounts={bankCounts}
          examCounts={examCounts}
        />
      </main>
    </div>
  );
}
