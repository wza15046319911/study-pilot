import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import ImmersiveSession from "@/app/practice/[subjectSlug]/immersive/ImmersiveSession";
import { Profile, Question } from "@/types/database";
import { decodeId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function HomeworkImmersivePage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const decodedHomeworkId = decodeId(slug);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/homework/${slug}/immersive`);
  }

  let { data: homework } = await (supabase.from("homeworks") as any)
    .select("*, subject:subjects(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!homework && decodedHomeworkId !== null) {
    const fallbackResult = await (supabase.from("homeworks") as any)
      .select("*, subject:subjects(*)")
      .eq("id", decodedHomeworkId)
      .eq("is_published", true)
      .maybeSingle();
    homework = fallbackResult.data;
  }

  if (!homework) {
    redirect("/profile/homework");
  }

  if (homework.allowed_modes && !homework.allowed_modes.includes("immersive")) {
    redirect("/profile/homework");
  }

  const { data: profileData } = await (supabase.from("profiles") as any)
    .select("username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  if (!profileData?.is_vip) {
    redirect("/pricing");
  }

  const { data: assignment } = await supabase
    .from("homework_assignments")
    .select("id")
    .eq("user_id", user.id)
    .eq("homework_id", homework.id)
    .single();

  if (!assignment) {
    redirect("/profile/homework");
  }

  const { data: items } = await supabase
    .from("homework_items")
    .select("question:questions(*)")
    .eq("homework_id", homework.id)
    .order("order_index")
    .limit(1);

  const firstQuestion = ((items?.[0] as any)?.question as Question) || null;

  const profile = profileData as Profile | null;
  const userData = {
    username: profile?.username || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  const sessionUser = profile || {
    id: user.id,
    username: userData.username,
    level: 1,
    streak_days: 0,
    avatar_url: null,
    created_at: new Date().toISOString(),
    last_practice_date: null,
    is_vip: true,
    vip_expires_at: null,
    active_session_id: null,
    is_admin: false,
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-slate-950">
      <AmbientBackground />
      <Header user={userData} />
      <ImmersiveSession
        initialQuestion={firstQuestion}
        subjectId={homework.subject_id}
        subjectName={`${homework.title}`}
        user={sessionUser}
      />
    </div>
  );
}
