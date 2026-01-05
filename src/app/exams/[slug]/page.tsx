import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import {
  Clock,
  ChevronRight,
  GraduationCap,
  Play,
  Check,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ExamPreviewPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/exams/${slug}`);
  }

  // Fetch Exam + Subject info
  const { data: exam, error: examError } = await (
    supabase.from("exams") as any
  )
    .select(
      `
      *,
      subject:subjects(id, name, slug, icon)
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!exam || examError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Exam Not Found"
            description="The exam you are trying to access does not exist."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  // Fetch User Profile
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  // Check if exam is completed (optional, logic might vary)
  // For now, assume exams are always accessible (no lock logic for Mock Exams generally)

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-12">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href="/library"
            className="hover:text-blue-600 transition-colors"
          >
            Library
          </Link>
           <ChevronRight className="size-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {exam.title}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left Column: Exam Cover */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Exam Cover Visualization (Violet Theme) */}
            <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-r-2xl rounded-l-sm transform shadow-2xl mb-8 group perspective-[1500px]">
              <div className="absolute inset-0 bg-[#8b5cf6] rounded-r-2xl rounded-l-sm shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)] overflow-hidden border-l-8 border-[#4c1d95]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20 mix-blend-overlay pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/30" />

                <div className="relative h-full flex flex-col p-8 z-10">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 text-white font-bold text-base tracking-wide">
                      <GraduationCap className="size-3.5" />
                      Mock Exam
                    </div>
                  </div>

                  <div className="mt-4 mb-auto text-center">
                    <div className="w-12 h-0.5 bg-white/40 mb-6 mx-auto opacity-70" />
                    <h3 className="text-3xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-md">
                      {exam.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-white/40 mt-6 mx-auto opacity-70" />
                  </div>

                  <div className="text-center mt-8">
                    <div className="text-xs font-mono text-purple-100 tracking-[0.2em] uppercase opacity-80 mb-2">
                      {exam.duration_minutes} MINS
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white font-bold text-sm bg-purple-900/30 py-2 rounded-lg border border-purple-400/30">
                       Full Simulation
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                {exam.title}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic text-balance">
                &quot;Test your knowledge under real exam conditions.&quot;
              </p>
            </div>

            {/* Exam Details Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                     <Clock className="size-6" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Duration</h3>
                     <p className="text-slate-500 dark:text-slate-400">{exam.duration_minutes} Minutes</p>
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                     <FileText className="size-6" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Format</h3>
                     <p className="text-slate-500 dark:text-slate-400">Full {exam.exam_type} Simulation</p>
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto">
                <div className="flex flex-col gap-4">
                  <Link
                    href={`/practice/${exam.subject.slug}/exam/${exam.slug}`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto min-w-[200px] text-lg rounded-xl shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Play className="size-5 mr-2 fill-current" />
                      Start Mock Exam
                    </Button>
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
