"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "@/components/ui/CodeBlock";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Link,
  Eye,
  EyeOff,
  Heading2,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  className = "",
  minHeight = "150px",
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback(
    (before: string, after: string = "", placeholder: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end) || placeholder;
      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  const toolbarButtons = [
    {
      icon: Heading2,
      title: "Heading",
      action: () => insertText("## ", "", "Heading"),
    },
    {
      icon: Bold,
      title: "Bold",
      action: () => insertText("**", "**", "bold text"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => insertText("*", "*", "italic text"),
    },
    {
      icon: Code,
      title: "Code",
      action: () => insertText("`", "`", "code"),
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => insertText("- ", "", "item"),
    },
    {
      icon: ListOrdered,
      title: "Numbered List",
      action: () => insertText("1. ", "", "item"),
    },
    {
      icon: Link,
      title: "Link",
      action: () => insertText("[", "](url)", "link text"),
    },
  ];

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-1 px-2 py-1.5 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-0.5">
          {toolbarButtons.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={btn.action}
              className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors"
              title={btn.title}
            >
              <btn.icon className="size-4" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
            showPreview
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              : "text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700"
          }`}
        >
          {showPreview ? (
            <>
              <EyeOff className="size-3.5" />
              Edit
            </>
          ) : (
            <>
              <Eye className="size-3.5" />
              Preview
            </>
          )}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="p-3 prose prose-sm dark:prose-invert max-w-none overflow-auto"
          style={{ minHeight }}
        >
          {value ? (
            <ReactMarkdown
              components={{
                pre: ({ children }) => <>{children}</>,
                code: ({ className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match && !String(children).includes("\n");
                  
                  if (!isInline) {
                    return (
                      <div className="not-prose my-4">
                        <CodeBlock
                          code={String(children).replace(/\n$/, "")}
                          language={match ? match[1] : "plaintext"}
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 text-sm bg-transparent resize-none focus:outline-none text-[#0d121b] dark:text-white placeholder-gray-400"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
