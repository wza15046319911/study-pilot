import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { PracticeSetupContent } from "./PracticeSetupContent";
import { Profile, Subject } from "@/types/database";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
  }>;
}

export default async function SetupPage(props: PageProps) {
  const params = await props.params;
  const { subjectSlug } = params;

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Explicit type assertion
  const profile = profileData as Profile | null;

  if (!subjectSlug) {
    redirect("/library");
  }

  const decodedSubjectId = decodeId(subjectSlug);
  let subject: Subject | null = null;

  const { data: subjectBySlug } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .maybeSingle();
  subject = (subjectBySlug as Subject | null) || null;

  if (!subject && decodedSubjectId !== null) {
    const { data: subjectById } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", decodedSubjectId)
      .maybeSingle();
    subject = (subjectById as Subject | null) || null;
  }

  if (!subject) {
    redirect("/library");
  }

  // Fetch topics with real question count
  const { data: topicsData } = await supabase
    .from("topics")
    .select("*, questions(count)")
    .eq("subject_id", subject.id);

  // Transform to include count
  const topics = (topicsData || []).map((topic: any) => ({
    ...topic,
    question_count: topic.questions?.[0]?.count || 0,
  }));

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />
      <PracticeSetupContent
        subject={subject}
        topics={topics || []}
        user={userData}
      />
    </div>
  );
}
