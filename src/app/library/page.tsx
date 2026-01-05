import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { redirect } from "next/navigation";
import { LibraryContent } from "./LibraryContent";

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

  const isVip = profile?.is_vip || false;
  
  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: isVip,
  };

  // 3. Fetch Subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("id");

  // 4. Fetch Question Banks
  const { data: banks } = await (supabase.from("question_banks") as any)
    .select(
      `
      *,
      items:question_bank_items(count)
    `
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 5. Fetch Exams
  const { data: exams } = await supabase
    .from("exams")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 6. Fetch Unlocks
  const { data: unlocks } = await supabase
    .from("user_bank_unlocks")
    .select("bank_id") // Assuming for banks only for now, exams might be different or part of same system
    .eq("user_id", user.id);

  const unlockedBankIds = new Set((unlocks || []).map((u: any) => u.bank_id));

  // 7. Grouping Logic
  const groupedBanks = (banks || []).reduce((acc: any, bank: any) => {
    const sId = bank.subject_id;
    if (!acc[sId]) acc[sId] = [];
    acc[sId].push(bank);
    return acc;
  }, {});

  const groupedExams = (exams || []).reduce((acc: any, exam: any) => {
    const sId = exam.subject_id;
    if (!acc[sId]) acc[sId] = [];
    acc[sId].push(exam);
    return acc;
  }, {});


  return (
    <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-950 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-8xl mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Library
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Everything you need, organized by subject.
          </p>
        </div>

        <LibraryContent 
          subjects={subjects || []}
          groupedBanks={groupedBanks}
          groupedExams={groupedExams}
          isVip={isVip}
          unlockedBankIds={unlockedBankIds}
        />
      </main>
    </div>
  );
}
