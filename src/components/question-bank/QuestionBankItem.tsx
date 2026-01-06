"use client";

import { useRouter } from "next/navigation";
import { Lock, Crown, Star, Gift, DollarSign } from "lucide-react";

interface QuestionBankItemProps {
  bank: any;
  isVip: boolean;
  questionCount: number;
  isUnlocked?: boolean; // For referral-type banks
  variant?: "default" | "exam" | "practice"; // New variant prop
  titleOverride?: string;
  subtitleOverride?: string;
  onClickOverride?: () => void;
  subjectSlug?: string; // For constructing proper /library URLs
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

  // Check if locked based on unlock type
  const isReferralType = bank.unlock_type === "referral";
  const isPaidType = bank.unlock_type === "paid";
  const isPremiumLocked = bank.is_premium && !isVip;
  const isReferralLocked = isReferralType && !isUnlocked;
  const isPaidLocked = isPaidType && !isUnlocked;
  // Exams and Practice usually don't have lock logic or handled differently, but if we reuse this, let's respect bank object if present
  const isLocked =
    (isPremiumLocked || isReferralLocked || isPaidLocked) &&
    variant === "default";

  const handleCardClick = () => {
    if (onClickOverride) {
      onClickOverride();
      return;
    }
    // Navigate to the bank page regardless of lock status
    // The individual bank page handles the locked state display/unlocking logic
    // Use /library path if subjectSlug is provided
    if (subjectSlug) {
      router.push(`/library/${subjectSlug}/question-banks/${bank.slug}`);
    } else {
      // Fallback to old path for backwards compatibility (legacy usage)
      router.push(`/library`);
    }
  };

  const containerClasses = `group relative w-full aspect-[3/4] perspective-[1500px] cursor-pointer ${
    isLocked ? "transition-transform duration-300 hover:scale-[1.02]" : ""
  }`;

  // Color Variants
  const styles = {
    default: {
      backCover: "bg-[#3e2723]",
      frontCover: "bg-[#e0c097]",
      border: "border-[#5d4037]",
      spine: "bg-[#3e2723]",
      textTitle: "text-[#fff8e1]",
      textDesc: "text-[#efebe9]",
    },
    exam: {
      backCover: "bg-[#3e2723]", // Match default brown
      frontCover: "bg-[#e0c097]", // Match default beige
      border: "border-[#5d4037]", // Match default brown border
      spine: "bg-[#3e2723]",
      textTitle: "text-[#fff8e1]",
      textDesc: "text-[#efebe9]",
    },
    practice: {
      backCover: "bg-[#0c4a6e]", // sky-900
      frontCover: "bg-[#38bdf8]", // sky-400
      border: "border-[#075985]", // sky-800
      spine: "bg-[#0c4a6e]",
      textTitle: "text-[#f0f9ff]",
      textDesc: "text-sky-100",
    },
  };

  const currentStyle = styles[variant];

  return (
    <div onClick={handleCardClick} className={`${containerClasses}`}>
      {/* Book Container */}
      <div
        className={`relative w-full h-full duration-700 preserve-3d transition-transform ease-[cubic-bezier(0.25,1,0.5,1)] ${
          !isLocked
            ? "group-hover:translate-x-4 group-hover:rotate-y-[-5deg]"
            : "group-hover:animate-shake-small"
        }`}
      >
        {/* ================= BACK COVER & PAGES (Static Base) ================= */}
        <div
          className={`absolute inset-0 ${currentStyle.backCover} rounded-r-xl rounded-l-sm shadow-xl transform translate-z-[-20px]`}
        >
          {/* Right page edges (Thickness) */}
          <div className="absolute top-1 bottom-1 right-0 w-6 bg-[#fffcf5] border-l border-gray-300 transform translate-x-5 rotate-y-90 origin-right rounded-sm">
            <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,#e5e5e5_2px)] opacity-50" />
          </div>

          {/* INSIDE CONTENT (Visible when opened) - Empty */}
          <div className="absolute inset-2 bg-[#fffcf5] rounded-r-lg shadow-inner" />
        </div>

        {/* ================= FRONT COVER (Rotates) ================= */}
        <div
          className={`absolute inset-0 origin-left duration-700 preserve-3d transition-transform ease-[cubic-bezier(0.2,0,0.2,1)] z-20 ${
            !isLocked
              ? "group-hover:rotate-y-[-30deg] group-hover:shadow-2xl"
              : ""
          }`}
        >
          {/* --- FRONT FACE --- */}
          <div
            className={`absolute inset-0 ${currentStyle.frontCover} rounded-r-xl rounded-l-sm shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)] overflow-hidden border-l-8 ${currentStyle.border} backface-hidden`}
          >
            {/* Kraft Paper Texture / Noise Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 mix-blend-multiply" />

            {/* Edge/Wear effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/20 mix-blend-overlay pointer-events-none" />

            {/* Spine Highlight */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/30" />

            {/* Book Content Container */}
            <div className="relative h-full flex flex-col p-6 z-10">
              {/* Top Badge */}
              <div className="flex justify-between items-start mb-4">
                <div className="opacity-100">
                  {(variant === "default" || variant === "exam") &&
                    (isPaidType ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/90 to-indigo-600/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-blue-400/50 text-blue-50 font-bold text-base tracking-wide">
                        <DollarSign className="size-5 drop-shadow-md" />
                        <span className="drop-shadow-md">
                          {bank.price ? `$${bank.price}` : "Paid"}
                        </span>
                      </div>
                    ) : isReferralType ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/90 to-violet-600/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-purple-400/50 text-purple-50 font-bold text-base tracking-wide">
                        <Gift className="size-5 drop-shadow-md" />
                        <span className="drop-shadow-md">Invite Unlock</span>
                      </div>
                    ) : bank.is_premium ? (
                      // Updated with lighter color for Premium
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-zinc-400/90 to-slate-500/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-zinc-300/50 text-white font-bold text-base tracking-wide">
                        <Crown className="size-5 drop-shadow-md" />
                        <span className="drop-shadow-md">
                          Premium Collection
                        </span>
                      </div>
                    ) : (
                      // Only show Public Edition for default variant (Question Banks), hide for Exams
                      variant === "default" && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-green-400/50 text-green-50 font-bold text-base tracking-wide">
                          <Star className="size-5 drop-shadow-md fill-green-50" />
                          <span className="drop-shadow-md">Public Edition</span>
                        </div>
                      )
                    ))}

                  {variant === "practice" && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 text-white font-bold text-base tracking-wide">
                      <Star className="size-5 drop-shadow-md" />
                      <span className="drop-shadow-md">Full Practice</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Area */}
              <div className="mt-4 mb-auto">
                <div className="w-12 h-0.5 bg-white/40 mb-4 mx-auto opacity-70" />
                <h3
                  className={`text-2xl md:text-3xl font-serif font-bold ${currentStyle.textTitle} text-center leading-tight tracking-tight drop-shadow-md`}
                >
                  {titleOverride || bank.title}
                </h3>
                <div className="w-12 h-0.5 bg-white/40 mt-4 mx-auto opacity-70" />
                <p
                  className={`mt-6 ${currentStyle.textDesc} text-sm text-center font-serif leading-relaxed line-clamp-4 italic opacity-90 px-2 drop-shadow-sm`}
                >
                  &ldquo;
                  {subtitleOverride ||
                    bank.description ||
                    "A curated collection of problems."}
                  &rdquo;
                </p>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col items-center gap-3 mt-4">
                <div className="text-xs font-mono text-white/60 tracking-widest uppercase opacity-90 border-t border-b border-white/20 py-1 px-3">
                  {/* Logic for count or time */}
                  {variant === "exam"
                    ? `${bank.duration_minutes || 120} MINS`
                    : `Vol. ${questionCount || "ALL"} Items`}
                </div>

                {isLocked ? (
                  <div className="mt-2 text-[#d7ccc8] font-bold text-sm flex items-center gap-2">
                    {isReferralLocked ? (
                      <>
                        <Gift className="size-4" />
                        <span>INVITE TO UNLOCK</span>
                      </>
                    ) : isPaidLocked ? (
                      <>
                        <DollarSign className="size-4" />
                        <span>PURCHASE REQUIRED</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" />
                        <span>LOCKED</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    className={`mt-2 ${currentStyle.textTitle} text-xs font-serif italic opacity-80`}
                  >
                    Click to Open
                  </div>
                )}
              </div>
            </div>

            {/* Locked Metal Band */}
            {isLocked && (
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-12 h-24 bg-gradient-to-l from-[#4a4a4a] to-[#2a2a2a] rounded-l-lg shadow-xl flex items-center justify-center border-l border-t border-b border-gray-600 z-30">
                <div className="relative bg-gradient-to-br from-yellow-600 to-yellow-800 w-8 h-12 rounded shadow-inner flex flex-col items-center justify-center border border-yellow-900 px-1">
                  <div className="w-1.5 h-3 bg-black rounded-full mb-1 z-10" />
                  <div className="w-0.5 h-2 bg-black z-10" />
                </div>
              </div>
            )}
          </div>

          {/* --- BACK FACE (Inside Cover) --- */}
          <div
            className={`absolute inset-0 ${currentStyle.backCover} rounded-l-xl rounded-r-sm overflow-hidden transform rotate-y-180 backface-hidden border-r-8 border-black/20`}
          >
            {/* Paper texture for inside cover */}
            <div className="absolute inset-2 border border-white/10 rounded-lg opacity-50 flex items-center justify-center">
              <div className="text-white/20 font-serif italic text-center p-8 text-sm">
                Ex Libris
                <br />
                StudyPilot
                <br />
                2026
              </div>
            </div>
          </div>
        </div>

        {/* Shadow beneath the book */}
        <div
          className={`absolute -bottom-6 left-4 right-4 h-6 bg-black/30 blur-xl rounded-[100%] transition-all duration-500 group-hover:scale-x-110 group-hover:opacity-20`}
        />
      </div>
    </div>
  );
}
