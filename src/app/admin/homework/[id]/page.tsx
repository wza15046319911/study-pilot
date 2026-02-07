import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeworkBuilder from "../HomeworkBuilder";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditHomeworkPage(props: PageProps) {
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

  const homeworkPromise = (supabase.from("homeworks") as any)
    .select("*")
    .eq("slug", id)
    .maybeSingle();

  const [{ data: subjects }, homeworkResult] = await Promise.all([
    subjectsPromise,
    homeworkPromise,
  ]);

  let homework = homeworkResult.data;

  if (!homework) {
    if (decodedId !== null) {
      const fallbackResult = await (supabase.from("homeworks") as any)
        .select("*")
        .eq("id", decodedId)
        .maybeSingle();
      homework = fallbackResult.data;
    }
  }

  if (!homework) {
    redirect("/admin/homework");
  }

  const { data: items } = await supabase
    .from("homework_items")
    .select("question:questions(*)")
    .eq("homework_id", homework.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  const initialData = {
    ...homework,
    questions,
  };

  return <HomeworkBuilder subjects={subjects || []} initialData={initialData} />;
}
