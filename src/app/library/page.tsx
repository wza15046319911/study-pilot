import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { redirect } from "next/navigation";
import { LibraryContent } from "./LibraryContent";

export const metadata = {
  title: "Library | StudyPilot",
  description: "Your complete learning resource library.",
};

export default async function LibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  const userData = {
    username: profile?.username || user.email?.split("@")[0] || "User",
    avatar_url: profile?.avatar_url ?? undefined,
    is_vip: profile?.is_vip || false,
  };

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("id");

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 overflow-x-hidden">
      <AmbientBackground />
      <Header user={userData} />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-16 relative z-10">
        <LibraryContent subjects={subjects || []} />
      </main>
    </div>
  );
}
