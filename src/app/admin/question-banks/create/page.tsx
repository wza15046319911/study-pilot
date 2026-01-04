import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BankBuilder from "../BankBuilder";

export default async function CreateQuestionBankPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch subjects for dropdown
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  return <BankBuilder subjects={subjects || []} />;
}
