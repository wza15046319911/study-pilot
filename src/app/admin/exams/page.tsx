import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Plus, FileText, Clock, CheckCircle } from "lucide-react";

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
            Exam Management
          </h1>
          <p className="text-[#4c669a]">Create and manage mock exams</p>
        </div>
        <Link href="/admin/exams/create">
          <Button size="lg">
            <Plus className="size-5 mr-2" />
            Create Exam
          </Button>
        </Link>
      </div>

      {Object.keys(groupedExams).length === 0 ? (
        <GlassPanel className="p-12 text-center">
          <FileText className="size-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">
            No exams yet
          </h2>
          <p className="text-gray-400 mb-6">
            Create your first exam to get started.
          </p>
          <Link href="/admin/exams/create">
            <Button>Create Exam</Button>
          </Link>
        </GlassPanel>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExams).map(([subjectName, exams]) => (
            <div key={subjectName}>
              <h2 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#135bec]" />
                {subjectName}
                <span className="text-sm font-normal text-gray-400">
                  ({exams.length})
                </span>
              </h2>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam) => (
                  <Link key={exam.id} href={`/admin/exams/${exam.id}`}>
                    <GlassPanel className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              exam.exam_type === "midterm"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {exam.exam_type.toUpperCase()}
                          </span>
                        </div>
                        {exam.is_published ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="size-3" />
                            Published
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Draft</span>
                        )}
                      </div>

                      <h3 className="font-bold text-[#0d121b] dark:text-white mb-1">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mb-2">
                        /{exam.slug}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-[#4c669a]">
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {Math.floor(exam.duration_minutes / 60)}h{" "}
                          {exam.duration_minutes % 60}m
                        </span>
                      </div>
                    </GlassPanel>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
