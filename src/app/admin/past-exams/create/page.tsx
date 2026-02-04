import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PastExamBuilder from "./PastExamBuilder";

export default async function CreatePastExamPage() {
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

  return <PastExamBuilder subjects={subjects || []} />;
}
