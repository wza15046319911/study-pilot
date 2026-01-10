"use client";

import { useMemo } from "react";
import { CodeBlock as AceternityCodeBlock } from "@/components/aceternity/code-block";

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
