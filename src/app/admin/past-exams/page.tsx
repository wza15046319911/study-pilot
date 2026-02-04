import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PastExamsClient } from "./PastExamsClient";

interface PastExamRow {
  id: number;
  year: number;
  semester: number;
  title: string | null;
  is_published: boolean;
  subject: { id: number; name: string } | null;
  items?: { count: number }[] | null;
}

export default async function PastExamsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: pastExams } = await (supabase.from("past_exams") as any)
    .select(
      `
      id,
      year,
      semester,
      title,
      is_published,
      subject:subjects(id, name),
      items:past_exam_questions(count)
    `
    )
    .order("year", { ascending: false })
    .order("semester", { ascending: false });

  const groupedPastExams = ((pastExams as PastExamRow[]) || []).reduce(
    (acc, exam) => {
      const subjectName = exam.subject?.name || "Unknown";
      if (!acc[subjectName]) acc[subjectName] = [];
      acc[subjectName].push(exam);
      return acc;
    },
    {} as Record<string, PastExamRow[]>
  );

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Past Exam Answers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage past exam answer keys by subject, year, and semester.
          </p>
        </div>
        <Link href="/admin/past-exams/create">
          <Button className="gap-2 shadow-lg shadow-rose-500/20">
            <Plus className="size-4" />
            Create Past Exam
          </Button>
        </Link>
      </div>

      <PastExamsClient groupedPastExams={groupedPastExams} />
    </main>
  );
}
