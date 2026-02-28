"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const AceternityCodeBlock = dynamic(
  () =>
    import("@/components/aceternity/code-block").then(
      (module) => module.CodeBlock,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full rounded-lg bg-slate-900 p-4 font-mono text-sm">
        <div className="h-28 w-full animate-pulse rounded bg-slate-800/70" />
      </div>
    ),
  },
);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  // Handle literal escaped newlines that might come from the database
  const formattedCode = useMemo(() => code.replace(/\\n/g, "\n"), [code]);

  return (
    <AceternityCodeBlock
      code={formattedCode}
      language={language}
    />
  );
}
