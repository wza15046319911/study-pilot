import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PastExamBuilder from "../create/PastExamBuilder";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPastExamPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();

  const pastExamPromise = adminClient
    .from("past_exams")
    .select("*")
    .eq("id", id)
    .single();

  const questionsPromise = adminClient
    .from("past_exam_questions")
    .select("*")
    .eq("past_exam_id", id)
    .order("order_index", { ascending: true });

  const subjectsPromise = adminClient
    .from("subjects")
    .select("id, name")
    .order("name");

  const [
    { data: pastExam, error },
    { data: questions },
    { data: subjects },
  ] = await Promise.all([pastExamPromise, questionsPromise, subjectsPromise]);

  if (error || !pastExam) {
    notFound();
  }

  const initialData = {
    ...(pastExam as any),
    questions: questions || [],
  };

  return <PastExamBuilder subjects={subjects || []} initialData={initialData} />;
}
