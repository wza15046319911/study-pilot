import { createClient } from "@/lib/supabase/server";
import QuestionsClient from "./QuestionsClient";

export default async function AdminQuestionsPage() {
  const supabase = await createClient();

  // Get all subjects for filter
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  return (
    <>
      <QuestionsClient subjects={subjects || []} />
    </>
  );
}
