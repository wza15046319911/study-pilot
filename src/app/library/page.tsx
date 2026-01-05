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
    <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-950 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Library
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Choose a subject to explore practice materials, mock exams, and
            question banks.
          </p>
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
