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
  FileText,
  Layers,
  BookOpen,
  Home,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ExportExamButton } from "@/components/exam/ExportExamButton";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    examSlug: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: exam } = await (supabase.from("exams") as any)
    .select("title")
    .eq("slug", params.examSlug)
    .single();

  return {
    title: exam
      ? `${exam.title} | Mock Exam | StudyPilot`
      : "Mock Exam | StudyPilot",
    description: exam
      ? `Practice with ${exam.title} mock exam.`
      : "Mock exam simulation.",
  };
}

export default async function LibraryExamPreviewPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug, examSlug } = params;
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/library/${subjectSlug}/exams/${examSlug}`);
  }

  // Fetch Subject
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as {
    id: number;
    slug: string;
    name: string;
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
            description="The subject you are trying to access does not exist."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  // Fetch Exam
  const { data: exam, error: examError } = await (supabase.from("exams") as any)
    .select("*")
    .eq("slug", examSlug)
    .eq("subject_id", subject.id)
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
            backLink={`/library/${subjectSlug}`}
            backText="Back to Subject"
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

  // Fetch question count for this exam
  const { count: questionCount } = await supabase
    .from("exam_questions")
    .select("*", { count: "exact", head: true })
    .eq("exam_id", exam.id);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc] dark:bg-slate-950">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 flex-wrap">
          <Link
            href="/library"
            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <Home className="size-4" />
            Library
          </Link>
          <ChevronRight className="size-4" />
          <Link
            href={`/library/${subjectSlug}`}
            className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            {subject.icon && <span>{subject.icon}</span>}
            {subject.name}
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
            {exam.title}
          </span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Exam Cover */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-full max-w-[320px] aspect-[3/4] rounded-r-2xl rounded-l-sm transform shadow-2xl mb-8 group">
              <div className="absolute inset-0 bg-[#8b5cf6] rounded-r-2xl rounded-l-sm shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)] overflow-hidden border-l-8 border-[#4c1d95]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20 mix-blend-overlay pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/30" />

                <div className="relative h-full flex flex-col p-8 z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/90 to-violet-600/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-purple-400/50 text-purple-50 font-bold text-base tracking-wide">
                      <GraduationCap className="size-5 drop-shadow-md" />
                      <span className="drop-shadow-md">Mock Exam</span>
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
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                {exam.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Test your knowledge under real exam conditions with this mock
                exam.
              </p>
            </div>

            {/* Exam Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-0.5">
                    Duration
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {exam.duration_minutes} Minutes
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-0.5">
                    Questions
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {questionCount || 0} Questions
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Choose Mode
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Link href={`/practice/${subjectSlug}/exam/${examSlug}`}>
                  <Button
                    size="lg"
                    className="w-full rounded-xl shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Play className="size-5 mr-2 fill-current" />
                    Start Mock Exam
                  </Button>
                </Link>

                <ExportExamButton
                  examId={exam.id}
                  examTitle={exam.title}
                  examType={exam.exam_type}
                  durationMinutes={exam.duration_minutes}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
