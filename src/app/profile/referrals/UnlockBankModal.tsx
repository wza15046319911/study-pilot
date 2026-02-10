"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  LockOpen,
  Check,
  Wallet,
  Box,
} from "lucide-react";
import { unlockBankWithReferral } from "@/lib/actions/referral";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Animated Modal component
function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

interface UnlockBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  banks: any[];
  credits: number;
}

export function UnlockBankModal({
  isOpen,
  onClose,
  banks,
  credits,
}: UnlockBankModalProps) {
  const t = useTranslations("profileReferrals.modal");
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<number | null>(null);

  const handleUnlock = async (bankId: number) => {
    if (credits <= 0) return;
    setLoading(bankId);
    setError("");

    try {
      const result = await unlockBankWithReferral(bankId);
      if (result.success) {
        setSuccess(bankId);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unlockFailed"));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#09090b] shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        {/* Header Section */}
        <div className="px-6 pt-6 pb-4 flex justify-between items-start bg-white dark:bg-[#09090b]">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              {t("title")}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`
                inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${
                  credits > 0
                    ? "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    : "bg-red-50 border-red-100 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400"
                }
              `}
              >
                <Wallet className="size-3" />
                <span>
                  {t("credits", { count: credits })}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("close")}
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-slate-100 dark:bg-slate-800/60" />

        {/* Scrollable Content */}
        <div className="p-2 max-h-[60vh] overflow-y-auto bg-slate-50/50 dark:bg-[#0c0c0e]">
          {error && (
            <div className="m-4 mb-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {banks.length === 0 ? (
            /* Clean Empty State */
            <div className="py-16 flex flex-col items-center justify-center text-center px-6">
              <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
                <Box
                  className="size-8 text-slate-400 dark:text-slate-500"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-200">
                {t("empty.title")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                {t("empty.description")}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {banks.map((bank) => {
                const isSuccess = success === bank.id;
                const isLoading = loading === bank.id;

                return (
                  <div
                    key={bank.id}
                    className={`
                      relative flex items-center gap-4 p-4 rounded-xl border transition-[background-color,border-color,box-shadow] duration-200 group/card
                      ${
                        isSuccess
                          ? "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                          : "bg-white dark:bg-[#09090b] border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                      }
                    `}
                  >
                    {/* Icon Box */}
                    <div
                      className={`
                      size-12 rounded-lg flex items-center justify-center text-xl shrink-0 border
                      ${
                        isSuccess
                          ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                          : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover/card:bg-white dark:group-hover/card:bg-slate-800 transition-colors"
                      }
                    `}
                    >
                      {bank.subject?.icon || "📘"}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-semibold truncate transition-colors ${
                            isSuccess
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-200 group-hover/card:text-slate-900 dark:group-hover/card:text-white"
                          }`}
                        >
                          {bank.title}
                        </h3>
                        {/* Subject Badge */}
                        <span className="px-1.5 py-0.5 rounded text-[14px] font-medium bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          {bank.subject?.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {t("questions", { count: bank.items?.[0]?.count || 0 })}
                      </p>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleUnlock(bank.id)}
                      disabled={loading !== null || credits <= 0 || isSuccess}
                      size="sm"
                      className={`
                        h-9 px-4 shrink-0 transition-[background-color,border-color,box-shadow,color] font-medium rounded-lg text-xs
                        ${
                          isSuccess
                            ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 cursor-default"
                            : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:border-slate-600 shadow-sm"
                        }
                      `}
                    >
                      {isLoading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : isSuccess ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="size-3.5" />
                          <span>{t("actions.unlocked")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <LockOpen className="size-3.5 opacity-60" />
                          <span>{t("actions.unlock")}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {banks.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-[#0c0c0e] border-t border-slate-100 dark:border-slate-800/60">
            <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
              <span className="size-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              {t("footer")}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
