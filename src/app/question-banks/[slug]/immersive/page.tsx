import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ImmersiveSession } from "@/app/practice/[subjectSlug]/immersive/ImmersiveSession";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function QuestionBankImmersivePage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/question-banks/${slug}/immersive`);
  }

  const { data: bank } = await (supabase.from("question_banks") as any)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!bank) {
    redirect("/question-banks");
  }

  // Fetch Questions in Order
  const { data: items } = await supabase
    .from("question_bank_items")
    .select("question:questions(*)")
    .eq("bank_id", bank.id)
    .order("order_index");

  const questions = (items || []).map((item: any) => item.question);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#1a1a2e]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black z-0" />
      <ImmersiveSession
        questions={questions}
        subjectSlug={bank.slug}
      />
    </div>
  );
}
