import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WeeklyPracticeBuilder from "../WeeklyPracticeBuilder";

export default async function CreateWeeklyPracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  return <WeeklyPracticeBuilder subjects={subjects || []} />;
}
