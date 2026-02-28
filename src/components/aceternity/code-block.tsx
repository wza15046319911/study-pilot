"use client";
import React from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import jsLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import tsLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import pythonLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import javaLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/java";
import cLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/c";
import cppLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/cpp";
import bashLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import jsonLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import sqlLanguage from "react-syntax-highlighter/dist/cjs/languages/prism/sql";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

SyntaxHighlighter.registerLanguage("javascript", jsLanguage);
SyntaxHighlighter.registerLanguage("typescript", tsLanguage);
SyntaxHighlighter.registerLanguage("python", pythonLanguage);
SyntaxHighlighter.registerLanguage("java", javaLanguage);
SyntaxHighlighter.registerLanguage("c", cLanguage);
SyntaxHighlighter.registerLanguage("cpp", cppLanguage);
SyntaxHighlighter.registerLanguage("bash", bashLanguage);
SyntaxHighlighter.registerLanguage("json", jsonLanguage);
SyntaxHighlighter.registerLanguage("sql", sqlLanguage);

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  cxx: "cpp",
  cc: "cpp",
  csharp: "c",
};

const SUPPORTED_LANGUAGES = new Set([
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "bash",
  "json",
  "sql",
]);

function normalizeLanguage(language?: string) {
  if (!language) return null;
  const key = language.trim().toLowerCase();
  const normalized = LANGUAGE_ALIASES[key] || key;
  return SUPPORTED_LANGUAGES.has(normalized) ? normalized : null;
}

type CodeBlockProps = {
  language?: string;
  filename?: string;
  highlightLines?: number[];
} & (
  | {
      code: string;
      tabs?: never;
    }
  | {
      code?: never;
      tabs: Array<{
        name: string;
        code: string;
        language?: string;
        highlightLines?: number[];
      }>;
    }
);

export const CodeBlock = ({
  language = "typescript",
  filename,
  code,
  highlightLines = [],
  tabs = [],
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeCode = tabsExist ? tabs[activeTab].code : code;
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language;
  const normalizedLanguage = normalizeLanguage(activeLanguage);
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || highlightLines
    : highlightLines;
  const activeFilename = tabsExist ? tabs[activeTab].name : filename;

  return (
    <div className="relative w-full rounded-lg bg-slate-900 p-4 font-mono text-sm">
      <div className="flex flex-col gap-2">
        {tabsExist && (
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "px-3 py-1 text-xs transition-colors font-sans",
                  activeTab === index
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
        {!tabsExist && filename && (
          <div className="flex justify-between items-center py-2">
            <div className="text-xs text-slate-400">{filename}</div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}
        {(tabsExist || !filename) && (
          <div className="flex justify-between items-center py-2">
             <div className="text-xs text-slate-400">{tabsExist ? activeFilename : ""}</div>
             <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
         )}
      </div>
      {normalizedLanguage ? (
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "0.875rem",
          }}
          wrapLines={true}
          showLineNumbers={true}
          lineProps={(lineNumber) => ({
            style: {
              backgroundColor: activeHighlightLines.includes(lineNumber)
                ? "rgba(255,255,255,0.1)"
                : "transparent",
              display: "block",
              width: "100%",
            },
          })}
          PreTag="div"
        >
          {String(activeCode || "")}
        </SyntaxHighlighter>
      ) : (
        <pre className="m-0 overflow-x-auto bg-transparent p-0 text-sm text-slate-100">
          <code className="whitespace-pre">{String(activeCode || "")}</code>
        </pre>
      )}
    </div>
  );
};
