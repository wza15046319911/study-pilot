import { WholePageScroll } from "@/components/home/WholePageScroll";
import { createClient } from "@/lib/supabase/server";
import { Profile, Subject } from "@/types/database";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const supabase = await createClient();

  // Check for session
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    // Suppress auth errors (e.g. invalid refresh token) and treat as logged out
    console.error("Auth error:", error);
  }

  let userData = null;
  let isAdmin = false;

  if (user) {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = profileData as Profile | null;

    userData = {
      username:
        profile?.username ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User",
      avatar_url:
        profile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        undefined,
      is_vip: profile?.is_vip || false,
    };

    isAdmin =
      !!process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
  }

  // Fetch all subjects for the browse section
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("*")
    .order("name");

  const subjects = (subjectsData || []) as Subject[];
  const t = await getTranslations("home");
  const t2 = await getTranslations("results");
  const t3 = await getTranslations("subjects");

  const content = {
    hero: {
      title: t("title"),
      subtitle: t("subtitle"),
      completed: t("hero.completed"),
      tagList: t("hero.tagList"),
      tagFunction: t("hero.tagFunction"),
    },
    features: {
      title: t("features.title"),
      subtitle: t("features.subtitle"),
      coreFeatures: t("features.coreFeatures"),
      bank: {
        title: t("features.bank.title"),
        description: t("features.bank.description"),
      },
      mistakes: {
        title: t("features.mistakes.title"),
        description: t("features.mistakes.description"),
      },
      flow: {
        title: t("features.flow.title"),
        description: t("features.flow.description"),
      },
      flashcards: {
        title: t("features.flashcards.title"),
        description: t("features.flashcards.description"),
      },
    },
    stats: {
      users: t("stats.users"),
      subjects: t("stats.subjects"),
      questions: t("stats.questions"),
    },
    browse: {
      title: t("browseSubjects.title"),
      subtitle: t("browseSubjects.subtitle"),
      viewAll: t("browseSubjects.viewAll"),
    },
    results: {
      accuracy: t2("accuracy"),
    },
    analytics: {
      title: "Smart Analytics",
      subtitle: t("features.mistakes.description"), // Reusing existing text or hardcoding
      features: {
        radar: "Knowledge Radar",
        history: "History",
      },
    },
    common: {
      questions: t3("questions"),
    },
  };

  return (
    <WholePageScroll
      user={userData}
      isAdmin={isAdmin}
      subjects={subjects}
      content={content}
    />
  );
}
