"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  // Handle literal escaped newlines that might come from the database
  const formattedCode = code.replace(/\\n/g, "\n");

  return (
    <div className="rounded-xl overflow-hidden font-mono text-sm shadow-md">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: "1.5rem", background: "#1e293b" }}
        wrapLongLines={true}
      >
        {formattedCode}
      </SyntaxHighlighter>
    </div>
  );
}
