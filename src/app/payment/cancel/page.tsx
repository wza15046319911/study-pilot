import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { Header } from "@/components/layout/Header";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default async function PaymentCancelPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <AmbientBackground />
      <Header showNav={true} />

      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <GlassPanel className="max-w-lg w-full p-8 text-center">
          {/* Cancel Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-slate-200 dark:bg-slate-800 p-4">
              <XCircle className="size-12 text-slate-500 dark:text-slate-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-3 dark:text-white">
            Payment Cancelled
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your payment was cancelled. No charges have been made to your
            account.
          </p>

          {/* Info Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              If you encountered any issues during checkout or have questions
              about our pricing, please don&apos;t hesitate to{" "}
              <Link
                href="/contact"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                contact us
              </Link>
              .
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-[background-color,box-shadow] duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl"
            >
              Try Again
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-[background-color,border-color,color] duration-200"
            >
              <ArrowLeft className="size-5" />
              Continue with Free Plan
            </Link>
          </div>
        </GlassPanel>
      </main>
    </div>
  );
}
