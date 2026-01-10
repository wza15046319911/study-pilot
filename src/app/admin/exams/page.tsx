import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExamsClient } from "./ExamsClient";

interface Exam {
  id: number;
  title: string;
  slug: string;
  exam_type: string;
  duration_minutes: number;
  is_published: boolean;
  created_at: string;
  subjects: {
    id: number;
    name: string;
  };
}

export default async function AdminExamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all exams (admin bypass - in production check admin role)
  const { data: exams } = await supabase
    .from("exams")
    .select("*, subjects(id, name)")
    .order("created_at", { ascending: false });

  // Group by subject
  const groupedExams = ((exams as Exam[]) || []).reduce((acc, exam) => {
    const subjectName = exam.subjects?.name || "Unknown";
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(exam);
    return acc;
  }, {} as Record<string, Exam[]>);

  return <ExamsClient groupedExams={groupedExams} />;
}
