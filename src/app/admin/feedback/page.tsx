import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeedbackClient from "./FeedbackClient";

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  // Fetch all feedback with question details
  const { data: feedbackData } = await supabase
    .from("question_feedback")
    .select(
      `
      id,
      question_id,
      user_id,
      feedback_type,
      comment,
      status,
      created_at,
      questions!inner (
        id,
        title,
        content,
        subject_id,
        subjects!inner (
          id,
          name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  return <FeedbackClient feedback={feedbackData || []} />;
}
