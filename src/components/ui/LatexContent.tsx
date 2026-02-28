"use client";

import { useEffect, useRef } from "react";

interface LatexContentProps {
  children?: string;
  content?: string;
  className?: string;
}

type KatexModule = typeof import("katex");
let katexModulePromise: Promise<KatexModule> | null = null;

async function getKatexModule() {
  if (!katexModulePromise) {
    katexModulePromise = import("katex");
  }
  return katexModulePromise;
}

/**
 * Renders text with LaTeX expressions.
 * Supports inline math ($...$) and display math ($$...$$).
 */
export function LatexContent({
  children,
  content,
  className,
}: LatexContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  useEffect(() => {
    let cancelled = false;

    const renderContent = async () => {
      if (!containerRef.current) return;

      const source = children || content || "";
      const regex = /\$\$[\s\S]+?\$\$|\$[^$]+\$/g;
      const hasLatex = regex.test(source);
      regex.lastIndex = 0;

      if (!hasLatex) {
        containerRef.current.textContent = source;
        return;
      }

      const katex = (await getKatexModule()).default;
      if (cancelled || !containerRef.current) return;

      const parts: string[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(source)) !== null) {
        if (match.index > lastIndex) {
          parts.push(escapeHtml(source.slice(lastIndex, match.index)));
        }

        const token = match[0];
        const isDisplay = token.startsWith("$$");
        const tex = token.slice(isDisplay ? 2 : 1, isDisplay ? -2 : -1);

        try {
          parts.push(
            katex.renderToString(tex.trim(), {
              displayMode: isDisplay,
              throwOnError: false,
            }),
          );
        } catch {
          parts.push('<span class="text-red-500">[LaTeX Error]</span>');
        }

        lastIndex = match.index + token.length;
      }

      if (lastIndex < source.length) {
        parts.push(escapeHtml(source.slice(lastIndex)));
      }

      if (!cancelled && containerRef.current) {
        containerRef.current.innerHTML = parts.join("");
      }
    };

    void renderContent();

    return () => {
      cancelled = true;
    };
  }, [children, content]);

  return <div ref={containerRef} className={className} />;
}
