"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { BellRing } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { updateEmailNotificationPreference } from "./actions";

interface UserSettingsClientProps {
  initialEmailNotificationsEnabled: boolean;
}

export function UserSettingsClient({
  initialEmailNotificationsEnabled,
}: UserSettingsClientProps) {
  const t = useTranslations("profileSettings");
  const [enabled, setEnabled] = useState(initialEmailNotificationsEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (nextValue: boolean) => {
    const previousValue = enabled;
    setEnabled(nextValue);
    setError(null);

    startTransition(() => {
      void (async () => {
        const result = await updateEmailNotificationPreference(nextValue);
        if (!result.success) {
          setEnabled(previousValue);
          setError(result.error || t("errors.saveFailed"));
        }
      })();
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="size-12 shrink-0 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center">
            <BellRing className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("emailNotification.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {t("emailNotification.description")}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {t("emailNotification.hint")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label={t("emailNotification.title")}
          />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {enabled ? t("status.on") : t("status.off")}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 px-4 py-2 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </section>
  );
}
