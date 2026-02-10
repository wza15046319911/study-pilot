"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface NotFoundPageProps {
  title?: string;
  description?: string;
  backLink?: string;
  backText?: string;
}

export function NotFoundPage({
  title,
  description,
  backLink,
  backText,
}: NotFoundPageProps) {
  const t = useTranslations("notFound");
  const router = useRouter();
  const resolvedTitle = title || t("title");
  const resolvedDescription = description || t("description");
  const resolvedBackText = backText || t("goHome");

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
          className="mx-auto size-32 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/10 border border-gray-100 dark:border-gray-700 relative group"
        >
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <FileQuestion className="size-16 text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform duration-300 group-hover:text-blue-500" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          {resolvedTitle}
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
          {resolvedDescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto min-w-[140px] h-12 gap-2"
            onClick={() => (backLink ? router.push(backLink) : router.back())}
          >
            <ArrowLeft className="size-4" />
            {backLink ? resolvedBackText : t("goBack")}
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto min-w-[140px] h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/25">
              <Home className="size-4" />
              {t("returnHome")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
