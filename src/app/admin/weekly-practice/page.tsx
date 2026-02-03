import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WeeklyPracticeClient } from "./WeeklyPracticeClient";

export default async function WeeklyPracticeAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: practices } = await (supabase.from("weekly_practices") as any)
    .select(
      `
      *,
      subject:subjects(name),
      items:weekly_practice_items(count)
    `
    )
    .order("week_start", { ascending: false });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Weekly Practice
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Publish short public practice sets for each week.
          </p>
        </div>
        <Link href="/admin/weekly-practice/create">
          <Button className="gap-2 shadow-lg shadow-blue-500/20">
            <Plus className="size-4" />
            Create Weekly Practice
          </Button>
        </Link>
      </div>

      <WeeklyPracticeClient practices={practices || []} />
    </main>
  );
}
