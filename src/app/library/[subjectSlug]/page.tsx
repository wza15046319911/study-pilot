import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { redirect } from "next/navigation";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { SubjectContent } from "./SubjectContent";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: subjectData } = await supabase
    .from("subjects")
    .select("name")
    .eq("slug", params.subjectSlug)
    .single();

  const subject = subjectData as { name: string } | null;

  return {
    title: subject
      ? `${subject.name} | Library | StudyPilot`
      : "Subject | StudyPilot",
    description: subject
      ? `Practice materials, mock exams, and question banks for ${subject.name}.`
      : "Subject resources.",
  };
}

export default async function SubjectPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug } = params;
  const supabase = await createClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Subject
  const { data: subjectResult } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectResult as {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  } | null;

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

  // 3. Fetch Profile
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

  // 4. Fetch Exams for this subject
  const { data: exams } = await supabase
    .from("exams")
    .select("*")
    .eq("subject_id", subject.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 5. Fetch Question Banks for this subject
  const { data: banks } = await (supabase.from("question_banks") as any)
    .select(
      `
      *,
      items:question_bank_items(count)
    `
    )
    .eq("subject_id", subject.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 6. Fetch User Unlocks
  const { data: unlocks } = await supabase
    .from("user_bank_unlocks")
    .select("bank_id")
    .eq("user_id", user.id);

  const unlockedBankIds = new Set((unlocks || []).map((u: any) => u.bank_id));

  // 7. Fetch Question Count for this subject
  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("subject_id", subject.id);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f0f4fc] dark:bg-slate-950 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <Link
            href="/library"
            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <Home className="size-4" />
            Library
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
            {subject.icon && <span>{subject.icon}</span>}
            {subject.name}
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight flex items-center gap-3">
            {subject.icon && <span className="text-4xl">{subject.icon}</span>}
            {subject.name}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Explore practice materials, mock exams, and curated question banks.
          </p>
        </div>

        <SubjectContent
          subject={subject}
          exams={exams || []}
          banks={banks || []}
          isVip={isVip}
          unlockedBankIds={unlockedBankIds}
          questionCount={questionCount || 0}
        />
      </main>
    </div>
  );
}
