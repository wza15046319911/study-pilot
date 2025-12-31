import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExamBuilder from "./ExamBuilder";

export default async function CreateExamPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  return <ExamBuilder subjects={subjects || []} />;
}
