"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Select } from "@/components/ui/Select";

export function LanguageSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState("zh");

  // Read current locale from cookie on mount
  useEffect(() => {
    const cookieLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1];
    if (cookieLocale) {
      setLocale(cookieLocale);
    }
  }, []);

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    setLocale(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const languages = [
    { value: "zh", label: "中文" },
    { value: "en", label: "English" },
  ];

  return (
    <div className="w-28">
      <Select
        value={locale}
        onChange={handleSwitch}
        options={languages}
        className="h-10 text-xs py-1 px-2 pr-8 bg-gray-100 dark:bg-gray-800 border-none"
      />
    </div>
  );
}
