import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { Header } from "@/components/layout/Header";
import { QuestionBankPreviewContent } from "./QuestionBankPreviewContent";
import { decodeId, slugOrEncodedId } from "@/lib/ids";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function QuestionBankPreviewPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const decodedBankId = decodeId(slug);
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/question-banks/${slug}`);
  }

  // Fetch Bank + basic info
  let { data: bank, error: bankError } = await (
    supabase.from("question_banks") as any
  )
    .select(
      `
      id,
      title,
      slug,
      description,
      subject_id,
      unlock_type,
      is_premium,
      price,
      allowed_modes
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!bank && decodedBankId !== null) {
    const fallbackResult = await (supabase.from("question_banks") as any)
      .select(
        `
      id,
      title,
      slug,
      description,
      subject_id,
      unlock_type,
      is_premium,
      price,
      allowed_modes
    `,
      )
      .eq("id", decodedBankId)
      .maybeSingle();
    bank = fallbackResult.data;
    bankError = fallbackResult.error;
  }

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

  const profilePromise = (supabase.from("profiles") as any)
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const itemsPromise = supabase
    .from("question_bank_items")
    .select(
      `
      question:questions(
        difficulty,
        topic:topics(name)
      )
    `,
    )
    .eq("bank_id", bank.id);

  const collectionPromise = supabase
    .from("user_question_bank_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("bank_id", bank.id)
    .maybeSingle();

  const unlockPromise = (supabase.from("user_bank_unlocks") as any)
    .select("id, unlock_type")
    .eq("user_id", user.id)
    .eq("bank_id", bank.id)
    .maybeSingle();

  const [profileResult, itemsResult, collectionResult, unlockResult] =
    await Promise.all([
      profilePromise,
      itemsPromise,
      collectionPromise,
      unlockPromise,
    ]);

  const profile = profileResult.data as any;

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
    const unlock = unlockResult.data;
    if (unlock) {
      isUnlocked = true;
      unlockReason = unlock.unlock_type;
    }
  }

  // Fetch Stats Data: Items -> Questions -> Difficulty & Topic
  const items = itemsResult.data;

  const questions = (items || []).map((i: any) => i.question);
  const totalQuestions = questions.length;

  // Check if collected
  const isCollected = !!collectionResult.data;

  // Calculate Stats
  const difficultyCounts = questions.reduce(
    (acc: any, q: any) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 },
  );

  const topicCounts = questions.reduce((acc: any, q: any) => {
    const topicValue = Array.isArray(q.topic) ? q.topic[0] : q.topic;
    const topicName = topicValue?.name || "General";
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
      bank={{
        ...bank,
        routeId: slugOrEncodedId(bank.slug, bank.id),
      }}
      user={userData}
      difficultyCounts={difficultyCounts}
      sortedTopics={sortedTopics as any}
      totalQuestions={totalQuestions}
      isUnlocked={isUnlocked}
      unlockReason={unlockReason}
      isCollected={isCollected}
      allowedModes={bank.allowed_modes}
    />
  );
}
