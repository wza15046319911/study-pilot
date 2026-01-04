"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Crown, Star, Gift } from "lucide-react";

interface QuestionBankItemProps {
  bank: any;
  isVip: boolean;
  questionCount: number;
  isUnlocked?: boolean; // For referral-type banks
}

export function QuestionBankItem({
  bank,
  isVip,
  questionCount,
  isUnlocked = true,
}: QuestionBankItemProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({});

  // Check if locked based on unlock type
  const isReferralType = bank.unlock_type === "referral";
  const isPremiumLocked = bank.is_premium && !isVip;
  const isReferralLocked = isReferralType && !isUnlocked;
  const isLocked = isPremiumLocked || isReferralLocked;

  const handleCardClick = () => {
    if (isOpening) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();

    // Set initial position (fixed, at current location)
    setAnimationStyle({
      position: "fixed",
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 9999,
    });

    setIsOpening(true);

    // After a tiny delay, animate to fullscreen
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimationStyle({
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
        });
      });
    });

    // Navigate after animation completes
    setTimeout(() => {
      router.push(`/question-banks/${bank.slug}`);
    }, 800);
  };

  // When opening, render the card at fixed position
  const containerClasses = isOpening
    ? "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-xl overflow-hidden"
    : "group relative w-full aspect-[3/4] perspective-[1500px] cursor-pointer";

  return (
    <>
      {/* Placeholder to maintain layout when card becomes fixed */}
      {isOpening && <div className="w-full aspect-[3/4]" />}

      <div
        ref={cardRef}
        onClick={handleCardClick}
        style={isOpening ? animationStyle : {}}
        className={`${containerClasses}`}
      >
        {/* Book Container */}
        <div
          className={`relative w-full h-full duration-700 preserve-3d transition-transform ease-[cubic-bezier(0.25,1,0.5,1)] ${
            !isLocked && !isOpening
              ? "group-hover:translate-x-4 group-hover:rotate-y-[-5deg]"
              : ""
          }`}
        >
          {/* ================= BACK COVER & PAGES (Static Base) ================= */}
          <div className="absolute inset-0 bg-[#3e2723] rounded-r-xl rounded-l-sm shadow-xl transform translate-z-[-20px]">
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
              !isLocked && !isOpening
                ? "group-hover:rotate-y-[-30deg] group-hover:shadow-2xl"
                : ""
            } ${isOpening ? "rotate-y-[-140deg] shadow-2xl" : ""}`}
          >
            {/* --- FRONT FACE --- */}
            <div className="absolute inset-0 bg-[#e0c097] rounded-r-xl rounded-l-sm shadow-[inset_5px_0_15px_rgba(0,0,0,0.1)] overflow-hidden border-l-8 border-[#5d4037] backface-hidden">
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
                    {isReferralType ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/90 to-violet-600/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-purple-400/50 text-purple-50 font-bold text-base tracking-wide">
                        <Gift className="size-5 drop-shadow-md" />
                        <span className="drop-shadow-md">Invite Unlock</span>
                      </div>
                    ) : bank.is_premium ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/90 to-amber-600/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-yellow-400/50 text-yellow-50 font-bold text-base tracking-wide">
                        <Crown className="size-5 drop-shadow-md" />
                        <span className="drop-shadow-md">
                          Premium Collection
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/90 to-emerald-600/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-green-400/50 text-green-50 font-bold text-base tracking-wide">
                        <Star className="size-5 drop-shadow-md fill-green-50" />
                        <span className="drop-shadow-md">Public Edition</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title Area */}
                <div className="mt-4 mb-auto">
                  <div className="w-12 h-0.5 bg-[#d7ccc8] mb-4 mx-auto opacity-70" />
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#fff8e1] text-center leading-tight tracking-tight drop-shadow-md">
                    {bank.title}
                  </h3>
                  <div className="w-12 h-0.5 bg-[#d7ccc8] mt-4 mx-auto opacity-70" />
                  <p className="mt-6 text-[#efebe9] text-sm text-center font-serif leading-relaxed line-clamp-4 italic opacity-90 px-2 drop-shadow-sm">
                    &ldquo;
                    {bank.description || "A curated collection of problems."}
                    &rdquo;
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col items-center gap-3 mt-4">
                  <div className="text-xs font-mono text-[#d7ccc8] tracking-widest uppercase opacity-90 border-t border-b border-[#d7ccc8]/40 py-1 px-3">
                    Vol. {questionCount} Items
                  </div>

                  {isLocked ? (
                    <div className="mt-2 text-[#d7ccc8] font-bold text-sm flex items-center gap-2">
                      {isReferralLocked ? (
                        <>
                          <Gift className="size-4" />
                          <span>INVITE TO UNLOCK</span>
                        </>
                      ) : (
                        <>
                          <Lock className="size-4" />
                          <span>LOCKED</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-[#fff8e1]/80 text-xs font-serif italic">
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
            <div className="absolute inset-0 bg-[#3e2723] rounded-l-xl rounded-r-sm overflow-hidden transform rotate-y-180 backface-hidden border-r-8 border-[#2d1b18]">
              {/* Paper texture for inside cover */}
              <div className="absolute inset-2 border border-[#d7ccc8]/20 rounded-lg opacity-50 flex items-center justify-center">
                <div className="text-[#d7ccc8]/20 font-serif italic text-center p-8 text-sm">
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
            className={`absolute -bottom-6 left-4 right-4 h-6 bg-black/30 blur-xl rounded-[100%] transition-all duration-500 ${
              isOpening
                ? "opacity-0"
                : "group-hover:scale-x-110 group-hover:opacity-20"
            }`}
          />
        </div>
      </div>
    </>
  );
}
