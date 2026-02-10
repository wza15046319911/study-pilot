"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const localeFromIntl = useLocale();
  const tHeader = useTranslations("header");
  const [locale, setLocale] = useState(localeFromIntl);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocale(localeFromIntl);
  }, [localeFromIntl]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSwitch = (newLocale: string) => {
    setLocale(newLocale);
    setLocaleCookie(newLocale);
    router.refresh();
    setIsOpen(false);
  };

  const languages = [
    { value: "zh", label: "中文" },
    { value: "en", label: "English" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center font-bold text-sm"
        aria-label={tHeader("switchLanguage")}
      >
        {locale === "zh" ? "Zh" : "En"}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleSwitch(lang.value)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                locale === lang.value
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
