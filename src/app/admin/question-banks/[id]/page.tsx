import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BankBuilder from "../BankBuilder";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuestionBankPage(props: PageProps) {
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

  // Fetch subjects for dropdown
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name");

  // Fetch Bank Data
  const { data: bankBySlug } = await (supabase.from("question_banks") as any)
    .select("*")
    .eq("slug", id)
    .maybeSingle();

  let bank = bankBySlug;

  if (!bank && decodedId !== null) {
    const { data: bankById } = await (supabase.from("question_banks") as any)
      .select("*")
      .eq("id", decodedId)
      .maybeSingle();
    bank = bankById;
  }

  if (!bank) {
    redirect("/admin/question-banks");
  }

  // Fetch Bank Items (Questions)
  const { data: items } = await supabase
    .from("question_bank_items")
    .select("question:questions(*)")
    .eq("bank_id", bank.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  const initialData = {
    ...bank,
    questions,
  };

  return <BankBuilder subjects={subjects || []} initialData={initialData} />;
}
