import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WeeklyPracticeBuilder from "../WeeklyPracticeBuilder";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWeeklyPracticePage(props: PageProps) {
  const params = await props.params;
  const { id } = params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subjectsPromise = supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  const practicePromise = (supabase.from("weekly_practices") as any)
    .select("*")
    .eq("id", id)
    .single();

  const itemsPromise = supabase
    .from("weekly_practice_items")
    .select("question:questions(*)")
    .eq("weekly_practice_id", id)
    .order("order_index");

  const [{ data: subjects }, { data: practice }, { data: items }] =
    await Promise.all([subjectsPromise, practicePromise, itemsPromise]);

  if (!practice) {
    redirect("/admin/weekly-practice");
  }

  const questions = (items || []).map((item: any) => item.question);

  const initialData = {
    ...practice,
    questions,
  };

  return (
    <WeeklyPracticeBuilder subjects={subjects || []} initialData={initialData} />
  );
}
