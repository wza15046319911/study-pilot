import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { encodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{ subjectSlug: string; year: string; semester: string }>;
}

export default async function PastExamAnswerPage({ params }: PageProps) {
  const { subjectSlug, year, semester } = await params;
  const parsedYear = parseInt(year, 10);
  const parsedSemester = parseInt(semester, 10);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=/library/${subjectSlug}/past-exams/${year}/${semester}`,
    );
  }

  if (!parsedYear || ![1, 2].includes(parsedSemester)) {
    redirect(`/library/${subjectSlug}`);
  }

  const subjectResult = await supabase
    .from("subjects")
    .select("id")
    .eq("slug", subjectSlug)
    .single();
  const subject = subjectResult.data as { id: number } | null;

  if (!subject) {
    redirect("/library");
  }

  const latestPastExamResult = await supabase
    .from("past_exams")
    .select("id")
    .eq("subject_id", subject.id)
    .eq("year", parsedYear)
    .eq("semester", parsedSemester)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const latestPastExam = latestPastExamResult.data as { id: number } | null;

  if (!latestPastExam) {
    redirect(`/library/${subjectSlug}`);
  }

  redirect(
    `/library/${subjectSlug}/past-exams/${parsedYear}/${parsedSemester}/${encodeId(latestPastExam.id)}`,
  );
}
