import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { ExamPreviewContent } from "./ExamPreviewContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ExamPreviewPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/exams/${slug}`);
  }

  // Fetch Exam + Subject info
  const { data: exam, error: examError } = await (supabase.from("exams") as any)
    .select(
      `
      id,
      slug,
      title,
      description,
      subject_id,
      exam_type,
      duration_minutes,
      unlock_type,
      is_premium,
      price,
      subject:subjects(id, name, slug, icon)
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!exam || examError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Exam Not Found"
            description="The exam you are trying to access does not exist."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  // Fetch User Profile
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  let isUnlocked = false;

  if (exam.unlock_type === "free") {
    isUnlocked = true;
  } else if (exam.unlock_type === "premium" && profile?.is_vip) {
    isUnlocked = true;
  } else {
    const { data: unlock } = await (supabase.from("user_exam_unlocks") as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("exam_id", exam.id)
      .single();

    if (unlock) {
      isUnlocked = true;
    }
  }

  // Check if collected
  const { data: collectionEntry } = await supabase
    .from("user_exam_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("exam_id", exam.id)
    .maybeSingle();

  const isCollected = !!collectionEntry;

  return (
    <ExamPreviewContent
      exam={exam}
      user={userData}
      isCollected={isCollected}
      isUnlocked={isUnlocked}
    />
  );
}
