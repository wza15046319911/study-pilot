import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { Header } from "@/components/layout/Header";
import { QuestionBankPreviewContent } from "@/app/question-banks/[slug]/QuestionBankPreviewContent";
import { slugOrEncodedId } from "@/lib/ids";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    questionBankSlug: string;
  }>;
}

type BankPreviewRow = {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  subject_id: number;
  unlock_type: "free" | "premium" | "referral" | "paid";
  is_premium: boolean;
  price: number | null;
  allowed_modes: string[] | null;
  subject: {
    name: string;
    slug: string | null;
    icon?: string | null;
  } | null;
};

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_vip: boolean | null;
};

type UnlockRow = {
  id: number;
  unlock_type: string;
};

type BankItemStatsRow = {
  question: {
    difficulty: "easy" | "medium" | "hard" | string;
    topic: { name: string } | { name: string }[] | null;
  } | null;
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const fallbackTitle = params.questionBankSlug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: fallbackTitle
      ? `${fallbackTitle} | Question Bank | StudyPilot`
      : "Question Bank | StudyPilot",
    description: fallbackTitle
      ? `Practice with ${fallbackTitle} question bank.`
      : "Question bank preview.",
  };
}

export default async function LibraryQuestionBankPreviewPage(props: PageProps) {
  const t = await getTranslations("libraryErrors");
  const params = await props.params;
  const { subjectSlug, questionBankSlug } = params;
  const supabase = await createClient();

  // Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=/library/${subjectSlug}/question-banks/${questionBankSlug}`,
    );
  }

  const { data: banks, error: bankError } = await supabase
    .from("question_banks")
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
      allowed_modes,
      subject:subjects(name, slug, icon)
    `,
    )
    .eq("slug", questionBankSlug);

  const bank = ((banks as BankPreviewRow[] | null) || []).find(
    (candidate) => candidate.subject?.slug === subjectSlug,
  );

  if (!bank || bankError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f0f4fc]">
        <AmbientBackground />
        <Header user={{ username: t("fallbackUser") }} />
        <div className="flex-grow flex items-center justify-center">
          <NotFoundPage
            title={t("questionBankNotFound.title")}
            description={t("questionBankNotFound.description")}
            backLink={`/library/${subjectSlug}`}
            backText={t("questionBankNotFound.backToSubject")}
          />
        </div>
      </div>
    );
  }

  const profilePromise = supabase
    .from("profiles")
    .select("id, username, avatar_url, is_vip")
    .eq("id", user.id)
    .single();

  const unlockPromise = supabase
    .from("user_bank_unlocks")
    .select("id, unlock_type")
    .eq("user_id", user.id)
    .eq("bank_id", bank.id)
    .maybeSingle();

  const collectionPromise = supabase
    .from("user_question_bank_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("bank_id", bank.id)
    .maybeSingle();

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

  const [profileResult, unlockResult, collectionResult, itemsResult] =
    await Promise.all([
      profilePromise,
      unlockPromise,
      collectionPromise,
      itemsPromise,
    ]);

  const profile = profileResult.data as ProfileRow | null;
  const unlock = unlockResult.data as UnlockRow | null;

  // Check Unlock Status
  let isUnlocked = false;
  let unlockReason = "";

  if (bank.unlock_type === "free") {
    isUnlocked = true;
    unlockReason = "Free";
  } else if (bank.unlock_type === "premium" && profile?.is_vip) {
    isUnlocked = true;
    unlockReason = "Premium";
  } else if (unlock) {
    isUnlocked = true;
    unlockReason = unlock.unlock_type;
  }

  const items = (itemsResult.data || []) as BankItemStatsRow[];
  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  const topicCounts: Record<string, number> = {};
  let totalQuestions = 0;

  for (const item of items) {
    const question = item?.question;
    if (!question) continue;

    totalQuestions += 1;

    if (question.difficulty in difficultyCounts) {
      difficultyCounts[question.difficulty as keyof typeof difficultyCounts] +=
        1;
    }

    const topicValue = Array.isArray(question.topic)
      ? question.topic[0]
      : question.topic;
    const topicName = topicValue?.name || "General";
    topicCounts[topicName] = (topicCounts[topicName] || 0) + 1;
  }

  const sortedTopics = (Object.entries(topicCounts) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const isCollected = !!collectionResult.data;

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || t("fallbackUser"),
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  // Override the base URL for library context
  const bankWithLibraryContext = {
    ...bank,
    libraryBasePath: `/library/${subjectSlug}/question-banks/${questionBankSlug}`,
    routeId: slugOrEncodedId(bank.slug, bank.id),
  };

  return (
    <QuestionBankPreviewContent
      bank={bankWithLibraryContext}
      user={userData}
      difficultyCounts={difficultyCounts}
      sortedTopics={sortedTopics}
      totalQuestions={totalQuestions}
      isUnlocked={isUnlocked}
      unlockReason={unlockReason}
      isCollected={isCollected}
      allowedModes={bank.allowed_modes ?? undefined}
      libraryContext={{
        subjectSlug,
        subjectName: bank.subject?.name || subjectSlug,
        subjectIcon: bank.subject?.icon ?? undefined,
      }}
    />
  );
}
