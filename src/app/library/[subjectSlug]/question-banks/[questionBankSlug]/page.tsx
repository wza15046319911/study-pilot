import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NotFoundPage } from "@/components/ui/NotFoundPage";
import { Header } from "@/components/layout/Header";
import { QuestionBankPreviewContent } from "@/app/question-banks/[slug]/QuestionBankPreviewContent";

interface PageProps {
  params: Promise<{
    subjectSlug: string;
    questionBankSlug: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: bank } = await (supabase.from("question_banks") as any)
    .select("title")
    .eq("slug", params.questionBankSlug)
    .single();

  return {
    title: bank
      ? `${bank.title} | Question Bank | StudyPilot`
      : "Question Bank | StudyPilot",
    description: bank
      ? `Practice with ${bank.title} question bank.`
      : "Question bank preview.",
  };
}

export default async function LibraryQuestionBankPreviewPage(props: PageProps) {
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

  // Fetch subject
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subjectSlug)
    .single();

  const subject = subjectData as {
    id: number;
    slug: string;
    name: string;
    icon?: string;
  } | null;

  if (!subject) {
    redirect("/library");
  }

  // Fetch Bank
  const { data: bank, error: bankError } = await (
    supabase.from("question_banks") as any
  )
    .select(
      `
      *,
      subject:subjects(name, icon)
    `,
    )
    .eq("slug", questionBankSlug)
    .eq("subject_id", subject.id)
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
            backLink={`/library/${subjectSlug}`}
            backText="Back to Subject"
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

  // Fetch Stats Data
  const { data: items } = await supabase
    .from("question_bank_items")
    .select(
      `
      question:questions(
        difficulty,
        topic_id
      )
    `,
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

  // Check if collected
  const { data: collectionEntry } = await supabase
    .from("user_question_bank_collections")
    .select("id")
    .eq("user_id", user.id)
    .eq("bank_id", bank.id)
    .maybeSingle();

  const isCollected = !!collectionEntry;

  // Calculate Stats
  const difficultyCounts = questions.reduce(
    (acc: any, q: any) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 },
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

  // Override the base URL for library context
  const bankWithLibraryContext = {
    ...bank,
    libraryBasePath: `/library/${subjectSlug}/question-banks/${questionBankSlug}`,
  };

  return (
    <QuestionBankPreviewContent
      bank={bankWithLibraryContext}
      user={userData}
      difficultyCounts={difficultyCounts}
      sortedTopics={sortedTopics as any}
      totalQuestions={totalQuestions}
      isUnlocked={isUnlocked}
      unlockReason={unlockReason}
      isCollected={isCollected}
      libraryContext={{
        subjectSlug,
        subjectName: subject.name,
        subjectIcon: subject.icon,
      }}
    />
  );
}
