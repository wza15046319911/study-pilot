import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MistakesClient from "./MistakesClient";

export default async function MistakesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch mistakes with question details
  const { data: mistakes } = await supabase
    .from("mistakes")
    .select(
      `
      id,
      question_id,
      last_wrong_answer,
      error_count,
      created_at,
      questions!inner (
        id,
        title,
        content,
        difficulty,
        type,
        answer,
        options,
        subject_id,
        subjects!inner (
          id,
          name,
          slug
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("last_error_at", { ascending: false });

  return <MistakesClient mistakes={mistakes || []} userId={user.id} />;
}
