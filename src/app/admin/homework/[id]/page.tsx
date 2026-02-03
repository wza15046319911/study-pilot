import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeworkBuilder from "../HomeworkBuilder";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditHomeworkPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;
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

  const { data: homework } = await (supabase.from("homeworks") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (!homework) {
    redirect("/admin/homework");
  }

  const { data: items } = await supabase
    .from("homework_items")
    .select("question:questions(*)")
    .eq("homework_id", id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  const initialData = {
    ...homework,
    questions,
  };

  return <HomeworkBuilder subjects={subjects || []} initialData={initialData} />;
}
