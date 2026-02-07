import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WeeklyPracticeBuilder from "../WeeklyPracticeBuilder";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWeeklyPracticePage(props: PageProps) {
  const params = await props.params;
  const { id } = params;
  const decodedId = decodeId(id);
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

  const practiceBySlugPromise = (supabase.from("weekly_practices") as any)
    .select("*")
    .eq("slug", id)
    .maybeSingle();

  const [{ data: subjects }, { data: practiceBySlug }] = await Promise.all([
    subjectsPromise,
    practiceBySlugPromise,
  ]);

  let practice = practiceBySlug;

  if (!practice && decodedId !== null) {
    const { data: practiceById } = await (supabase.from("weekly_practices") as any)
      .select("*")
      .eq("id", decodedId)
      .maybeSingle();
    practice = practiceById;
  }

  if (!practice) {
    redirect("/admin/weekly-practice");
  }

  const { data: items } = await supabase
    .from("weekly_practice_items")
    .select("question:questions(*)")
    .eq("weekly_practice_id", practice.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  const initialData = {
    ...practice,
    questions,
  };

  return (
    <WeeklyPracticeBuilder subjects={subjects || []} initialData={initialData} />
  );
}
