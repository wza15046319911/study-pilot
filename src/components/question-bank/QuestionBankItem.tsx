"use client";

import { useRouter } from "next/navigation";
import { EvervaultCard, Icon } from "@/components/aceternity/evervault-card";
import { HoverBorderGradient } from "@/components/aceternity/hover-border-gradient";
import { Lock, Crown, Star, Gift, DollarSign, BookOpen } from "lucide-react";

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
}: QuestionBankItemProps) {
  const router = useRouter();

  const isReferralType = bank.unlock_type === "referral";
  const isPaidType = bank.unlock_type === "paid";
  const isPremiumLocked = bank.is_premium && !isVip;
  const isReferralLocked = isReferralType && !isUnlocked;
  const isPaidLocked = isPaidType && !isUnlocked;
  const isLocked = (isPremiumLocked || isReferralLocked || isPaidLocked) && variant === "default";

  const handleCardClick = () => {
    if (onClickOverride) {
      onClickOverride();
      return;
    }
    if (subjectSlug) {
      router.push(`/library/${subjectSlug}/question-banks/${bank.slug}`);
    } else {
      router.push(`/library`);
    }
  };

  const title = titleOverride || bank.title;
  const description = subtitleOverride || bank.description || "A curated collection of problems.";
  const metaInfo = variant === "exam"
    ? `${bank.duration_minutes || 120} MINS`
    : `Vol. ${questionCount || "ALL"} Items`;

  // Determine badge icon and text
  let badgeIcon = null;
  let badgeText = "";
  
  if (isPaidType) {
    badgeIcon = <DollarSign className="size-3.5" />;
    badgeText = bank.price ? `$${bank.price}` : "Paid";
  } else if (isReferralType) {
    badgeIcon = <Gift className="size-3.5" />;
    badgeText = "Invite to Unlock";
  } else if (bank.is_premium) {
    badgeIcon = <Crown className="size-3.5" />;
    badgeText = "Premium";
  } else if (variant === "default") {
    badgeIcon = <Star className="size-3.5" />;
    badgeText = "Public";
  }

  // Use Evervault Card for Exam type to give it a distinct look
  if (variant === "exam") {
    return (
      <div 
        onClick={handleCardClick} 
        className="relative group cursor-pointer border border-black/[0.2] dark:border-white/[0.2] rounded-3xl w-full h-[28rem] overflow-hidden"
      >
        <EvervaultCard text={title} className="h-full" />
        
        {/* Overlay Content */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
           <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
              <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
              <p className="text-white/80 text-xs line-clamp-2 mb-2">{description}</p>
              <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                <span className="bg-white/20 px-2 py-0.5 rounded">{metaInfo}</span>
                {badgeText && <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">{badgeText}</span>}
              </div>
           </div>
        </div>
        
        {/* Top Right Icon */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
           <Icon className="size-6 text-white/50" />
        </div>
      </div>
    );
  }

  // Use HoverBorderGradient for Standard Question Banks
  return (
    <div onClick={handleCardClick} className="cursor-pointer h-full">
      <HoverBorderGradient
        containerClassName="rounded-3xl h-full"
        className="w-full h-full bg-white dark:bg-black p-6 flex flex-col items-start justify-between space-y-4"
      >
        {/* Header / Badge */}
        <div className="w-full flex justify-between items-start">
          <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full">
             {isLocked ? <Lock className="size-5 text-slate-400" /> : <BookOpen className="size-5 text-blue-500" />}
          </div>
          {badgeText && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {badgeIcon}
              <span>{badgeText}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="w-full">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{metaInfo}</span>
          <span className="group-hover:translate-x-1 transition-transform duration-300">
            {isLocked ? "LOCKED" : "OPEN →"}
          </span>
        </div>
      </HoverBorderGradient>
    </div>
  );
}
