"use client";

import { useEffect, useRef } from "react";

export function LoginVisuals() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // --- Eye Tracking ---
      const eyes = container.querySelectorAll<HTMLElement>(".eye-pupil");
      eyes.forEach((eye) => {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left - rect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top - rect.top + eyeRect.height / 2;

        const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);
        const distance = Math.min(
          3,
          Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY) / 10
        );

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        eye.style.transform = `translate(${x}px, ${y}px)`;
      });

      // --- Body Tilt (Skew) ---
      const characters =
        container.querySelectorAll<HTMLElement>(".character-body");
      characters.forEach((char) => {
        // Get base skew from data attribute
        const baseSkew = parseFloat(char.dataset.baseSkew || "0");

        // Calculate tilt
        const centerX = 275;
        // Reduced intensity for subtle effect
        const tiltIntensity = 2;
        const deltaX = mouseX - centerX;

        const tilt = -1 * (deltaX / 300) * tiltIntensity;

        // Apply transform
        char.style.transform = `skewX(${baseSkew + tilt}deg)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="relative w-full h-full bg-[#111111] overflow-hidden flex items-center justify-center select-none"
      ref={containerRef}
    >
      {/* Branding */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg
            className="size-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
          </svg>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">
          StudyPilot
        </span>
      </div>

      {/* Characters Container - Scaled to fit */}
      <div
        className="relative"
        style={{
          width: 550,
          height: 400,
          transform: "scale(0.8) translateY(10%)",
        }}
      >
        {/* Purple Character */}
        {/* Body has longer transition (1500ms) to lag behind eyes */}
        <div
          className="character-body absolute bottom-0 transition-transform duration-[2500ms] ease-out"
          data-base-skew="-1.5"
          style={{
            left: 70,
            width: 180,
            height: 400,
            backgroundColor: "rgb(108, 63, 245)",
            borderRadius: "10px 10px 0px 0px",
            zIndex: 1,
            transform: "skewX(-1.5deg)",
            transformOrigin: "center bottom",
          }}
        >
          <div
            className="absolute flex gap-8 transition-all duration-700 ease-in-out"
            style={{ left: 54, top: 42 }}
          >
            <div className="flex items-center justify-center rounded-full bg-white overflow-hidden size-[18px]">
              <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[7px]" />
            </div>
            <div className="flex items-center justify-center rounded-full bg-white overflow-hidden size-[18px]">
              <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[7px]" />
            </div>
          </div>
        </div>

        {/* Black Character */}
        <div
          className="character-body absolute bottom-0 transition-transform duration-[1500ms] ease-out"
          data-base-skew="-0.4"
          style={{
            left: 240,
            width: 120,
            height: 310,
            backgroundColor: "rgb(45, 45, 45)",
            borderRadius: "8px 8px 0px 0px",
            zIndex: 2,
            transform: "skewX(-0.4deg)",
            transformOrigin: "center bottom",
          }}
        >
          <div
            className="absolute flex gap-6 transition-all duration-700 ease-in-out"
            style={{ left: 28, top: 32 }}
          >
            <div className="flex items-center justify-center rounded-full bg-white overflow-hidden size-[16px]">
              <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[6px]" />
            </div>
            <div className="flex items-center justify-center rounded-full bg-white overflow-hidden size-[16px]">
              <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[6px]" />
            </div>
          </div>
        </div>

        {/* Orange Character */}
        <div
          className="character-body absolute bottom-0 transition-transform duration-[1500ms] ease-out"
          data-base-skew="-1.9"
          style={{
            left: 0,
            width: 240,
            height: 200,
            zIndex: 3,
            backgroundColor: "rgb(255, 155, 107)",
            borderRadius: "120px 120px 0px 0px",
            transform: "skewX(-1.9deg)",
            transformOrigin: "center bottom",
          }}
        >
          <div
            className="absolute flex gap-8 transition-all duration-200 ease-out"
            style={{ left: 93, top: 88 }}
          >
            <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[12px]" />
            <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[12px]" />
          </div>
        </div>

        {/* Yellow Character */}
        <div
          className="character-body absolute bottom-0 transition-transform duration-[1500ms] ease-out"
          data-base-skew="0.3"
          style={{
            left: 310,
            width: 140,
            height: 230,
            backgroundColor: "rgb(232, 215, 84)",
            borderRadius: "70px 70px 0px 0px",
            zIndex: 4,
            transform: "skewX(0.3deg)",
            transformOrigin: "center bottom",
          }}
        >
          <div
            className="absolute flex gap-6 transition-all duration-200 ease-out"
            style={{ left: 50, top: 38 }}
          >
            <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[12px]" />
            <div className="eye-pupil rounded-full bg-[#2D2D2D] size-[12px]" />
          </div>
          {/* Mouth */}
          <div
            className="absolute h-[4px] w-20 rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out"
            style={{ left: 38, top: 86 }}
          />
        </div>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-8 right-8 flex gap-6 text-xs text-gray-500 font-medium">
        <a href="#" className="hover:text-white transition-colors">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Terms of Service
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Contact
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-colors"
        >
          <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
