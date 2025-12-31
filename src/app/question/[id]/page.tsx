import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSession } from "@/app/practice/[subjectSlug]/PracticeSession";
import { Profile, Question } from "@/types/database";
import { Frown } from "lucide-react";
import { decodeId } from "@/lib/ids";

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

  if (!user) {
    // Optionally redirect to login with return url
    redirect(`/login?next=/question/${rawId}`);
  }

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
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white/50 rounded-2xl backdrop-blur-sm">
            <Frown className="text-4xl text-gray-400 mb-2 mx-auto size-10" />
            <p className="text-gray-600">
              Question not found or you don't have permission to view it.
            </p>
            <a
              href="/subjects"
              className="text-[#135bec] hover:underline mt-4 block"
            >
              Back to Subjects
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fetch user profile for header
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
  };

  const sessionUser = profile || {
    id: user.id,
    username: userData.username,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
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
      />
    </div>
  );
}
