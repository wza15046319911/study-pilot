import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit2, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";

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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Title
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Subject
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Access
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {!banks || banks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No question banks found. Create one to get started.
                  </td>
                </tr>
              ) : (
                banks.map((bank: any) => (
                  <tr
                    key={bank.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {bank.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[300px]">
                        {bank.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {bank.subject?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 text-xs font-medium ${
                          bank.is_premium
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {bank.is_premium ? (
                          <>
                            <Lock className="size-3" />
                            Premium
                          </>
                        ) : (
                          <>
                            <Globe className="size-3" />
                            Free
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          bank.is_published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {bank.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/question-banks/${bank.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="size-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
