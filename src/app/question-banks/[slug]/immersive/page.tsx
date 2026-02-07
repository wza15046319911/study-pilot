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

export default async function QuestionBankImmersivePage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const decodedBankId = decodeId(slug);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/question-banks/${slug}/immersive`);
  }

  let { data: bank } = await (supabase.from("question_banks") as any)
    .select("id, title, subject_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!bank && decodedBankId !== null) {
    const fallbackResult = await (supabase.from("question_banks") as any)
      .select("id, title, subject_id")
      .eq("id", decodedBankId)
      .maybeSingle();
    bank = fallbackResult.data;
  }

  if (!bank) {
    redirect("/question-banks");
  }

  // Fetch first question from bank
  const { data: items } = await supabase
    .from("question_bank_items")
    .select(
      `
      question:questions(
        id,
        content,
        type,
        options,
        answer,
        explanation,
        code_snippet,
        test_cases,
        topic_id
      )
    `,
    )
    .eq("bank_id", bank.id)
    .order("order_index")
    .limit(1);

  const firstQuestion = ((items?.[0] as any)?.question as Question) || null;

  // Fetch user profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select(
      [
        "id",
        "username",
        "level",
        "streak_days",
        "avatar_url",
        "created_at",
        "last_practice_date",
        "is_vip",
        "vip_expires_at",
        "active_session_id",
        "is_admin",
      ].join(", "),
    )
    .eq("id", user.id)
    .single();

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
    is_vip: false,
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
        subjectId={bank.subject_id}
        subjectName={`${bank.title}`}
        user={sessionUser}
      />
    </div>
  );
}
