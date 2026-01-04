"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Loader2, LockOpen, Check, AlertCircle } from "lucide-react";
import { unlockBankWithReferral } from "@/lib/actions/referral";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Simple Modal component if Dialog doesn't exist
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl animate-in zoom-in-95 duration-200">
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
        // Wait a bit then refresh and maybe close
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <GlassPanel className="bg-white dark:bg-slate-900 border-none shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Unlock a Question Bank
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You have{" "}
              <span className="font-bold text-[#135bec]">{credits}</span>{" "}
              credits available.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}

          {banks.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No banks available to unlock right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {banks.map((bank) => {
                const isSuccess = success === bank.id;
                const isLoading = loading === bank.id;

                return (
                  <div
                    key={bank.id}
                    className={`
                                    relative p-4 rounded-xl border transition-all flex items-center justify-between gap-4
                                    ${
                                      isSuccess
                                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                        : "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                                    }
                                `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm">
                        {bank.subject?.icon || "📚"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {bank.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {bank.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-medium bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                            {bank.items?.[0]?.count || 0} Questions
                          </span>
                          <span className="text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">
                            {bank.subject?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleUnlock(bank.id)}
                      disabled={loading !== null || credits <= 0 || isSuccess}
                      variant={isSuccess ? "outline" : "primary"}
                      className={`
                                        shrink-0 min-w-[100px]
                                        ${
                                          isSuccess
                                            ? "border-green-500 text-green-600 bg-green-50"
                                            : ""
                                        }
                                    `}
                    >
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : isSuccess ? (
                        <>
                          <Check className="size-4 mr-1" />
                          Unlocked
                        </>
                      ) : (
                        <>
                          <LockOpen className="size-4 mr-1" />
                          Unlock
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </GlassPanel>
    </Modal>
  );
}
