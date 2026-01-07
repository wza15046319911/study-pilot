import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import ExamSession from "./ExamSession";
import { Profile, Question } from "@/types/database";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    examSlug: string;
  }>;
}

export default async function ExamPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug, examSlug } = params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!subjectSlug || !examSlug) {
    redirect("/library");
  }

  // Fetch subject to ensure correct redirect
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id, slug")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as { id: number; slug: string } | null;

  if (!subject) {
    redirect("/library");
  }

  // Fetch exam details
  const { data: examData } = await supabase
    .from("exams")
    .select("*")
    .eq("slug", examSlug)
    .eq("subject_id", (subject as any).id)
    .eq("is_published", true)
    .single();

  const exam = examData as any;

  if (!exam) {
    redirect(`/practice/${subject.slug}/exams`);
  }

  // Fetch exam questions with full question data
  const { data: examQuestions } = await supabase
    .from("exam_questions")
    .select("*, questions(*)")
    .eq("exam_id", exam.id)
    .order("order_index");

  const questions = (examQuestions || []).map(
    (eq: any) => eq.questions as Question
  );

  // Fetch profile
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

  const sessionUser = profile || {
    id: user.id,
    username: userData.username,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
    is_vip: false,
    vip_expires_at: null,
    active_session_id: null,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f0f4fc]">
      <AmbientBackground />
      <ExamSession
        exam={exam}
        questions={questions}
        user={sessionUser}
        subjectId={subject.id}
      />
    </div>
  );
}
