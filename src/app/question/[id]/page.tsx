import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { Profile, Question } from "@/types/database";
import { Frown } from "lucide-react";
import { decodeId } from "@/lib/ids";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuestionPage(props: PageProps) {
  const params = await props.params;
  const { id: rawId } = params;

  // Decode ID (supports both encoded string and legacy number)
  const id = decodeId(rawId);

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!id) {
    return (
      // Error state component (reuse existing or simple redirect)
      <div className="flex items-center justify-center min-h-screen">
        Invalid Question ID
      </div>
    );
  }

  // Fetch specific question
  const { data: questionData } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  const question = questionData as Question | null;

  if (!question) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "Guest" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Question Not Found"
            description="We couldn't find the question you're looking for. It might have been deleted or you may have followed a broken link."
            backLink="/library"
            backText="Back to Library"
          />
        </div>
      </div>
    );
  }

  // Fetch user profile for header if user exists
  let profile: Profile | null = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData as Profile | null;
  }

  const userData = {
    username: profile?.username || user?.email?.split("@")[0] || "Guest",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  // Create session user (real or guest)
  const sessionUser: Profile = profile || {
    id: user?.id || "guest-id",
    username: userData.username,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
    is_vip: false,
    vip_expires_at: null,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
      <AmbientBackground />
      <Header user={userData} />
      {/* 
        We use PracticeSession with a single question.
        We pass the question's subject_id so progress updates against the correct subject.
      */}
      <PracticeSession
        questions={[question]}
        user={sessionUser}
        subjectId={question.subject_id}
        mode="standalone"
        isGuest={!user}
      />
    </div>
  );
}
