import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { Header } from "@/components/layout/Header";
import { QuestionBankPreviewContent } from "./QuestionBankPreviewContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function QuestionBankPreviewPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/question-banks/${slug}`);
  }

  // Fetch Bank + basic items info
  const { data: bank, error: bankError } = await (
    supabase.from("question_banks") as any
  )
    .select(
      `
      *,
      subject:subjects(name, icon)
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!bank || bankError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: "User" }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title="Question Bank Not Found"
            description="The question bank you are trying to access does not exist."
            backLink="/question-banks"
            backText="Back to Question Banks"
          />
        </div>
      </div>
    );
  }

  // Fetch User Profile for Access Check
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  // Check Unlock Status
  let isUnlocked = false;
  let unlockReason = "";

  if (bank.unlock_type === "free") {
    // Free banks are always accessible
    isUnlocked = true;
    unlockReason = "Free";
  } else if (bank.unlock_type === "premium" && profile?.is_vip) {
    // Premium banks are accessible to VIP users
    isUnlocked = true;
    unlockReason = "Premium";
  } else {
    // For referral and paid banks (or premium without VIP), check explicit unlocks
    const { data: unlock } = await (supabase.from("user_bank_unlocks") as any)
      .select("id, unlock_type")
      .eq("user_id", user.id)
      .eq("bank_id", bank.id)
      .single();

    if (unlock) {
      isUnlocked = true;
      unlockReason = unlock.unlock_type;
    }
  }

  // Fetch Stats Data: Items -> Questions -> Difficulty & Topic
  const { data: items } = await supabase
    .from("question_bank_items")
    .select(
      `
      question:questions(
        difficulty,
        topic_id
      )
    `
    )
    .eq("bank_id", bank.id);

  const questions = (items || []).map((i: any) => i.question);
  const totalQuestions = questions.length;

  // Fetch Topics Map
  const { data: topics } = await supabase
    .from("topics")
    .select("id, name")
    .eq("subject_id", bank.subject_id);

  const topicMap = new Map(topics?.map((t: any) => [t.id, t.name]) || []);

  // Calculate Stats
  const difficultyCounts = questions.reduce(
    (acc: any, q: any) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  const topicCounts = questions.reduce((acc: any, q: any) => {
    const topicName =
      q.topic_id && topicMap.has(q.topic_id)
        ? topicMap.get(q.topic_id)
        : "General";
    acc[topicName] = (acc[topicName] || 0) + 1;
    return acc;
  }, {});

  const sortedTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  return (
    <QuestionBankPreviewContent
      bank={bank}
      user={userData}
      difficultyCounts={difficultyCounts}
      sortedTopics={sortedTopics as any}
      totalQuestions={totalQuestions}
      isUnlocked={isUnlocked}
      unlockReason={unlockReason}
    />
  );
}
