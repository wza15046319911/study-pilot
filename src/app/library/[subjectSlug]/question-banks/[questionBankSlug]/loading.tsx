import { AmbientBackground } from "@/components/layout/AmbientBackground";

export default function LoadingQuestionBankPreview() {
  return (
    <div className="relative min-h-screen w-full bg-[#f0f4fc] dark:bg-slate-950">
      <AmbientBackground />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 h-5 w-56 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="aspect-[3/4] animate-pulse rounded-3xl border border-slate-200/70 bg-white/70 p-8 dark:border-slate-800 dark:bg-slate-900/70" />
          </div>

          <div className="space-y-6 lg:col-span-8">
            <div className="h-12 w-3/4 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
            <div className="h-7 w-full animate-pulse rounded bg-slate-200/70 dark:bg-slate-800" />
            <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200/70 dark:bg-slate-800" />

            <div className="h-44 animate-pulse rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70" />
            <div className="h-64 animate-pulse rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70" />
          </div>
        </div>
      </main>
    </div>
  );
}
