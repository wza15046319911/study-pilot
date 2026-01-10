import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuestionBanksClient } from "./QuestionBanksClient";

export default async function QuestionBanksAdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch question banks with subject names
  const { data: banks } = await (supabase.from("question_banks") as any)
    .select(
      `
      *,
      subject:subjects(name)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Question Banks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage custom question sets for practice.
          </p>
        </div>
        <Link href="/admin/question-banks/create">
          <Button className="gap-2 shadow-lg shadow-blue-500/20">
            <Plus className="size-4" />
            Create Bank
          </Button>
        </Link>
      </div>

      <QuestionBanksClient banks={banks || []} />
    </main>
  );
}
