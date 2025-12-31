import { createClient } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default async function SharedMistakesPage(props: PageProps) {
  const params = await props.params;
  const { shareId } = params;

  const supabase = await createClient();

  // Fetch shared mistakes record
  const { data: sharedData } = await supabase
    .from("shared_mistakes")
    .select("*")
    .eq("share_id", shareId)
    .single();

  if (!sharedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <GlassPanel className="p-8 text-center max-w-md">
          <AlertTriangle className="size-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Link Not Found</h1>
          <p className="text-gray-500 mb-4">
            This share link doesn't exist or has been removed.
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go to Home
          </Link>
        </GlassPanel>
      </div>
    );
  }

  const shared = sharedData as {
    mistake_ids: number[];
    title: string | null;
    created_at: string;
  };

  // Fetch the actual mistakes with questions
  const { data: mistakesData } = await supabase
    .from("mistakes")
    .select(
      `
      id,
      question_id,
      last_wrong_answer,
      error_count,
      questions!inner (
        id,
        title,
        content,
        difficulty,
        answer,
        subjects!inner (
          id,
          name
        )
      )
    `
    )
    .in("id", shared.mistake_ids);

  const mistakes = (mistakesData || []) as any[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <AmbientBackground />
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">
            {shared.title || "Shared Mistakes"}
          </h1>
          <p className="text-[#4c669a] mt-1">
            {mistakes.length} question{mistakes.length !== 1 ? "s" : ""} •
            Shared on {new Date(shared.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Mistakes List */}
        <div className="space-y-4">
          {mistakes.map((mistake, index) => (
            <GlassPanel key={mistake.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    {mistake.questions.subjects.name}
                  </span>
                </div>
                <span className="text-xs text-red-500">
                  {mistake.error_count} error
                  {mistake.error_count !== 1 ? "s" : ""}
                </span>
              </div>

              <h3 className="font-semibold text-[#0d121b] dark:text-white mb-2">
                {mistake.questions.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {mistake.questions.content.slice(0, 200)}
                {mistake.questions.content.length > 200 && "..."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-red-500 uppercase flex items-center gap-1">
                    <XCircle className="size-3" />
                    Given Answer
                  </span>
                  <p className="font-mono text-[#0d121b] dark:text-gray-300">
                    {mistake.last_wrong_answer || "(No answer)"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-green-500 uppercase flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    Correct Answer
                  </span>
                  <p className="font-mono text-[#0d121b] dark:text-gray-300">
                    {mistake.questions.answer}
                  </p>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>

        {mistakes.length === 0 && (
          <GlassPanel className="p-8 text-center">
            <p className="text-gray-500">No mistakes found in this share.</p>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
