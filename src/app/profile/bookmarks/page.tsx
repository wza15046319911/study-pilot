import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookmarksClient from "./BookmarksClient";

export default async function BookmarksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch bookmarks with question and subject details
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(
      `
      id,
      question_id,
      created_at,
      questions!inner (
        id,
        title,
        content,
        difficulty,
        type,
        subject_id,
        subjects!inner (
          id,
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <BookmarksClient bookmarks={bookmarks || []} userId={user.id} />;
}
