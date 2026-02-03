import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HomeworksClient } from "./HomeworksClient";

export default async function HomeworksAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: homeworks } = await (supabase.from("homeworks") as any)
    .select(
      `
      *,
      subject:subjects(name),
      assignments:homework_assignments(count)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Homework
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Assign curated homework sets to premium students.
          </p>
        </div>
        <Link href="/admin/homework/create">
          <Button className="gap-2 shadow-lg shadow-blue-500/20">
            <Plus className="size-4" />
            Create Homework
          </Button>
        </Link>
      </div>

      <HomeworksClient homeworks={homeworks || []} />
    </main>
  );
}
