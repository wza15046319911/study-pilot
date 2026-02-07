"use client";

import { useRouter } from "next/navigation";
import { Lock, Crown, Star, Gift, DollarSign, ArrowRight, GraduationCap } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuestionBankItemProps {
  bank: any;
  isVip: boolean;
  questionCount: number;
  isUnlocked?: boolean;
  variant?: "default" | "exam" | "practice";
  titleOverride?: string;
  subtitleOverride?: string;
  onClickOverride?: () => void;
  subjectSlug?: string;
  href?: string;
}

export function QuestionBankItem({
  bank,
  isVip,
  questionCount,
  isUnlocked = true,
  variant = "default",
  titleOverride,
  subtitleOverride,
  onClickOverride,
  subjectSlug,
  href,
}: QuestionBankItemProps) {
  const router = useRouter();

  const isReferralType = bank.unlock_type === "referral";
  const isPaidType = bank.unlock_type === "paid";
  const isPremiumLocked = bank.is_premium && !isVip;
  const isReferralLocked = isReferralType && !isUnlocked;
  const isPaidLocked = isPaidType && !isUnlocked;
  const isLocked = isPremiumLocked || isReferralLocked || isPaidLocked;

  const targetHref =
    href ||
    (subjectSlug
      ? `/library/${subjectSlug}/question-banks/${bank.slug}`
      : "/library");

  const handlePrefetch = () => {
    if (targetHref) {
      router.prefetch(targetHref);
    }
  };

  const handleCardClick = () => {
    if (onClickOverride) {
      onClickOverride();
      return;
    }
    router.push(targetHref);
  };

  const title = titleOverride || bank.title;
  const description =
    subtitleOverride || bank.description || "A curated collection of problems.";
  const metaInfo =
    variant === "exam"
      ? `${bank.duration_minutes || 120} MINS`
      : `Vol. ${questionCount || "ALL"} Questions`;

  // Determine styling based on type
  let badgeIcon = null;
  let badgeText = "";
  let colorScheme = {
    border: "border-slate-200 dark:border-slate-700",
    bg: "bg-white/60 dark:bg-slate-900/60",
    badgeBg: "bg-slate-100 dark:bg-slate-800",
    badgeText: "text-slate-600 dark:text-slate-300",
    icon: "text-slate-500",
    hoverBorder: "group-hover:border-slate-300 dark:group-hover:border-slate-600",
    accentGradient: "from-slate-500/10 to-slate-500/0"
  };

  if (isPaidType) {
    badgeIcon = <DollarSign className="size-3.5" />;
    badgeText = bank.price ? `$${bank.price}` : "Paid";
    colorScheme = {
      border: "border-violet-200 dark:border-violet-800",
      bg: "bg-violet-50/30 dark:bg-violet-900/10",
      badgeBg: "bg-violet-100 dark:bg-violet-900/30",
      badgeText: "text-violet-700 dark:text-violet-300",
      icon: "text-violet-500",
      hoverBorder: "group-hover:border-violet-300 dark:group-hover:border-violet-600",
      accentGradient: "from-violet-500/10 to-violet-500/0"
    };
  } else if (isReferralType) {
    badgeIcon = <Gift className="size-3.5" />;
    badgeText = "Invite to Unlock";
    colorScheme = {
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-emerald-50/30 dark:bg-emerald-900/10",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/30",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      icon: "text-emerald-500",
      hoverBorder: "group-hover:border-emerald-300 dark:group-hover:border-emerald-600",
      accentGradient: "from-emerald-500/10 to-emerald-500/0"
    };
  } else if (bank.is_premium) {
    badgeIcon = <Crown className="size-3.5" />;
    badgeText = "Premium";
    colorScheme = {
      border: "border-amber-200 dark:border-amber-800",
      bg: "bg-amber-50/30 dark:bg-amber-900/10",
      badgeBg: "bg-amber-100 dark:bg-amber-900/30",
      badgeText: "text-amber-700 dark:text-amber-300",
      icon: "text-amber-500",
      hoverBorder: "group-hover:border-amber-300 dark:group-hover:border-amber-600",
      accentGradient: "from-amber-500/10 to-amber-500/0"
    };
  } else if (variant === "exam") {
    badgeIcon = <GraduationCap className="size-3.5" />;
    badgeText = "Mock Exam";
    colorScheme = {
      border: "border-indigo-200 dark:border-indigo-800",
      bg: "bg-indigo-50/30 dark:bg-indigo-900/10",
      badgeBg: "bg-indigo-100 dark:bg-indigo-900/30",
      badgeText: "text-indigo-700 dark:text-indigo-300",
      icon: "text-indigo-500",
      hoverBorder: "group-hover:border-indigo-300 dark:group-hover:border-indigo-600",
      accentGradient: "from-indigo-500/10 to-indigo-500/0"
    };
  } else if (variant === "default") {
    badgeIcon = <Star className="size-3.5" />;
    badgeText = "Public";
    // Default blue-ish tint for public
    colorScheme = {
      border: "border-blue-100 dark:border-blue-900/50",
      bg: "bg-blue-50/30 dark:bg-blue-900/10",
      badgeBg: "bg-blue-100 dark:bg-blue-900/30",
      badgeText: "text-blue-700 dark:text-blue-300",
      icon: "text-blue-500",
      hoverBorder: "group-hover:border-blue-300 dark:group-hover:border-blue-700",
      accentGradient: "from-blue-500/10 to-blue-500/0"
    };
  }

  // Liquid Glass Design for Standard Question Banks
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onPointerDown={handlePrefetch}
      className="h-full"
    >
      <GlassPanel
        className={cn(
          "h-full p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300",
          colorScheme.border,
          colorScheme.bg,
          colorScheme.hoverBorder,
          "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/50"
        )}
      >
        {/* Subtle Gradient Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", 
            colorScheme.accentGradient
          )} 
        />

        {/* Top Section */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase",
                colorScheme.badgeBg,
                colorScheme.badgeText
              )}
            >
              {badgeIcon}
              <span>{badgeText}</span>
            </div>
            
            {/* Lock Status Icon */}
            {isLocked && (
              <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Lock className="size-3.5" />
              </div>
            )}
          </div>

          <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 font-mono tracking-tight">
            {metaInfo}
          </span>
          
          <div className={cn(
            "flex items-center gap-1 text-sm font-bold transition-all duration-300 group-hover:translate-x-1",
            isLocked ? "text-slate-400" : "text-blue-600 dark:text-blue-400"
          )}>
            {isLocked ? (
              <span>LOCKED</span>
            ) : (
              <>
                <span>OPEN</span>
                <ArrowRight className="size-3.5" />
              </>
            )}
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
