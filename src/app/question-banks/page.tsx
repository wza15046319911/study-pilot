import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { QuestionBankItem } from "@/components/question-bank/QuestionBankItem";
import { redirect } from "next/navigation";
import { Lock, Globe, Search, BookOpen, Crown } from "lucide-react";

export const metadata = {
  title: "Question Banks | StudyPilot",
  description: "Curated question sets for focused practice.",
};

export default async function QuestionBanksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch User Profile (for VIP status)
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  const isVip = profile?.is_vip || false;

  // Fetch Question Banks
  const { data: banks } = await (supabase.from("question_banks") as any)
    .select(
      `
      *,
      subject:subjects(name, icon),
      items:question_bank_items(count)
    `
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Fetch User Unlocks
  const { data: unlocks } = await supabase
    .from("user_bank_unlocks")
    .select("bank_id")
    .eq("user_id", user.id);

  const unlockedBankIds = new Set((unlocks || []).map((u: any) => u.bank_id));

  // Group by Subject
  const groupedBanks = (banks || []).reduce((acc: any, bank: any) => {
    const subjectName = bank.subject?.name || "Other";
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(bank);
    return acc;
  }, {});

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: isVip,
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-950 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Question Banks
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Curated collections of problems designed to target specific skills.
            <br className="hidden md:block" />
            Pick a bank and master a topic.
          </p>
        </div>

        <div className="space-y-12">
          {Object.entries(groupedBanks).map(
            ([subject, subjectBanks]: [string, any]) => (
              <div
                key={subject}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {subject}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectBanks.map((bank: any) => (
                    <QuestionBankItem
                      key={bank.id}
                      bank={bank}
                      isVip={isVip}
                      isUnlocked={unlockedBankIds.has(bank.id)}
                      questionCount={bank.items?.[0]?.count || 0}
                      href={`/question-banks/${bank.slug}`}
                    />
                  ))}
                </div>
              </div>
            )
          )}

          {(!banks || banks.length === 0) && (
            <div className="text-center py-20">
              <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No question banks available yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
