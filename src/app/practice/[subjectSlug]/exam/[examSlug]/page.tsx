import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import ExamSession from "./ExamSession";
import { Profile, Question } from "@/types/database";
import { decodeId, slugOrEncodedId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    examSlug: string;
  }>;
}

export default async function ExamPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug, examSlug } = params;
  const decodedSubjectId = decodeId(subjectSlug);
  const decodedExamId = decodeId(examSlug);

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

  let subject: { id: number; slug: string } | null = null;
  const { data: subjectBySlug } = await supabase
    .from("subjects")
    .select("id, slug")
    .eq("slug", subjectSlug)
    .maybeSingle();

  subject = (subjectBySlug as { id: number; slug: string } | null) || null;

  if (!subject && decodedSubjectId !== null) {
    const { data: subjectById } = await supabase
      .from("subjects")
      .select("id, slug")
      .eq("id", decodedSubjectId)
      .maybeSingle();
    subject = (subjectById as { id: number; slug: string } | null) || null;
  }

  if (!subject) {
    redirect("/library");
  }

  // Fetch exam details
  let { data: examData } = await supabase
    .from("exams")
    .select(
      [
        "id",
        "title",
        "exam_type",
        "duration_minutes",
        "slug",
        "subject_id",
        "unlock_type",
        "is_premium",
        "price",
      ].join(", "),
    )
    .eq("slug", examSlug)
    .eq("subject_id", (subject as any).id)
    .eq("is_published", true)
    .maybeSingle();

  if (!examData && decodedExamId !== null) {
    const { data: examById } = await supabase
      .from("exams")
      .select(
        [
          "id",
          "title",
          "exam_type",
          "duration_minutes",
          "slug",
          "subject_id",
          "unlock_type",
          "is_premium",
          "price",
        ].join(", "),
      )
      .eq("id", decodedExamId)
      .eq("subject_id", (subject as any).id)
      .eq("is_published", true)
      .maybeSingle();
    examData = examById;
  }

  const resolvedExam = (examData as any) || null;

  if (!resolvedExam) {
    redirect(`/practice/${subject.slug}/exams`);
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "username",
        "level",
        "streak_days",
        "avatar_url",
        "created_at",
        "last_practice_date",
        "is_vip",
        "vip_expires_at",
        "active_session_id",
        "is_admin",
      ].join(", "),
    )
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  const isVip = profile?.is_vip || false;

  let isUnlocked = false;
  if (resolvedExam.unlock_type === "free") {
    isUnlocked = true;
  } else if (resolvedExam.unlock_type === "premium" && isVip) {
    isUnlocked = true;
  } else {
    const { data: unlock } = await (supabase.from("user_exam_unlocks") as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("exam_id", resolvedExam.id)
      .maybeSingle();
    if (unlock) {
      isUnlocked = true;
    }
  }

  if (!isUnlocked) {
    redirect(
      `/library/${subject.slug}/exams/${slugOrEncodedId(
        resolvedExam.slug,
        resolvedExam.id,
      )}`,
    );
  }

  // Fetch exam questions with full question data
  const { data: examQuestions } = await supabase
    .from("exam_questions")
    .select(
      `
      order_index,
      questions(
        id,
        content,
        type,
        options,
        answer,
        explanation,
        code_snippet,
        test_cases
      )
    `,
    )
    .eq("exam_id", resolvedExam.id)
    .order("order_index");

  const questions = (examQuestions || []).map(
    (eq: any) => eq.questions as Question,
  );

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
    is_admin: false,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f0f4fc]">
      <AmbientBackground />
      <ExamSession
        exam={resolvedExam}
        questions={questions}
        user={sessionUser}
        subjectId={subject.id}
        exitLink={`/library/${subject.slug}/exams/${slugOrEncodedId(
          resolvedExam.slug,
          resolvedExam.id,
        )}`}
      />
    </div>
  );
}
