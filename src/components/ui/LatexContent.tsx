"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface LatexContentProps {
  children: string;
  className?: string;
}

/**
 * Renders text with LaTeX expressions.
 * Supports inline math ($...$) and display math ($$...$$).
 */
export function LatexContent({ children, className }: LatexContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  useEffect(() => {
    if (!containerRef.current) return;

    const source = children || "";
    const parts: string[] = [];
    const regex = /\$\$[\s\S]+?\$\$|\$[^$]+\$/g;
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
          })
        );
      } catch {
        parts.push('<span class="text-red-500">[LaTeX Error]</span>');
      }

      lastIndex = match.index + token.length;
    }

    if (lastIndex < source.length) {
      parts.push(escapeHtml(source.slice(lastIndex)));
    }

    containerRef.current.innerHTML = parts.join("");
  }, [children]);

  return <div ref={containerRef} className={className} />;
}
