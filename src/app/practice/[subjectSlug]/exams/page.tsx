import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { Profile } from "@/types/database";
import { Clock, FileText, ChevronLeft, Play } from "lucide-react";

interface Exam {
  id: number;
  title: string;
  exam_type: string;
  duration_minutes: number;
  slug: string;
}

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

export default async function ExamListPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug } = params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!subjectSlug) {
    redirect("/subjects");
  }

  // Fetch subject by slug
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id, name, slug")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as {
    id: number;
    name: string;
    slug: string;
  } | null;

  if (!subject) {
    redirect("/subjects");
  }

  // Fetch published exams for this subject
  const { data: examsData } = await supabase
    .from("exams")
    .select("id, title, exam_type, duration_minutes, slug")
    .eq("subject_id", subject.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const exams = examsData as Exam[] | null;

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  const userData = {
    username: profile?.username || "User",
    avatar_url: profile?.avatar_url ?? undefined,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href={`/practice/${subject.slug}/setup`}
          className="inline-flex items-center gap-2 text-[#4c669a] hover:text-[#135bec] mb-6"
        >
          <ChevronLeft className="size-4" />
          Back to Setup
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-2">
            Mock Exams
          </h1>
          <p className="text-[#4c669a]">
            Available exams for{" "}
            <span className="font-semibold text-[#135bec]">{subject.name}</span>
          </p>
        </div>

        {!exams || exams.length === 0 ? (
          <GlassPanel className="p-12 text-center">
            <FileText className="size-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              No exams available
            </h2>
            <p className="text-gray-400">
              There are no published exams for this subject yet.
            </p>
          </GlassPanel>
        ) : (
          <div className="space-y-4">
            {(exams as Exam[]).map((exam) => (
              <GlassPanel
                key={exam.id}
                className="p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded mb-2 inline-block ${
                      exam.exam_type === "midterm"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {exam.exam_type.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-[#0d121b] dark:text-white">
                    {exam.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#4c669a]">
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {Math.floor(exam.duration_minutes / 60)}h{" "}
                      {exam.duration_minutes % 60}m
                    </span>
                  </div>
                </div>
                <Link href={`/practice/${subject.slug}/exam/${exam.slug}`}>
                  <Button>
                    <Play className="size-4 mr-2" />
                    Start Exam
                  </Button>
                </Link>
              </GlassPanel>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
