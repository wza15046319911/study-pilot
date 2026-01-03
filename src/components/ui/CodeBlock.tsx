"use client";

import Editor from "@monaco-editor/react";
import { useMemo } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  // Handle literal escaped newlines that might come from the database
  const formattedCode = useMemo(() => code.replace(/\\n/g, "\n"), [code]);

  // Calculate height based on line count (min 3 lines, max 20 lines)
  const lineCount = formattedCode.split("\n").length;
  const height = Math.min(Math.max(lineCount, 3), 20) * 20 + 20; // 20px per line + padding

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-slate-700">
      <Editor
        height={`${height}px`}
        language={language}
        value={formattedCode}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: "on",
          renderLineHighlight: "none",
          scrollbar: {
            vertical: "hidden",
            horizontal: "auto",
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          folding: false,
          contextmenu: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
