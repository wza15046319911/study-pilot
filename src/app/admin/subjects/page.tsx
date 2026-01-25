import { createClient } from "@/lib/supabase/server";
import { SubjectsClient } from "./SubjectsClient";

export default async function AdminSubjectsPage() {
  const supabase = await createClient();

  // Fetch all subjects ordered by ID
  const { data: subjects, error: subjError } = await supabase
    .from("subjects")
    .select("*")
    .order("id", { ascending: true });

  if (subjError) {
    console.error("Error fetching subjects:", subjError);
  }

  // Fetch all topics (optimization: fetch all at once instead of per subject request)
  const { data: topics, error: topicError } = await supabase
    .from("topics")
    .select("*")
    .order("id", { ascending: true });

  if (topicError) {
    console.error("Error fetching topics:", topicError);
  }

  // Fetch all subject exam dates
  const { data: examDates, error: examDatesError } = await supabase
    .from("subject_exam_dates")
    .select("*");

  if (examDatesError) {
    console.error("Error fetching exam dates:", examDatesError);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#0d121b] dark:text-white">
          Manage Subjects
        </h1>
        <p className="text-[#4c669a] dark:text-gray-400">
          Create, edit, and organize subjects and their topics.
        </p>
      </div>

      <SubjectsClient
        initialSubjects={subjects || []}
        initialTopics={topics || []}
        initialExamDates={examDates || []}
      />
    </div>
  );
}
