"use client";

import { useState } from "react";
import {
  X,
  Download,
  FileText,
  Share2,
  Calendar,
  Loader2,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { jsPDF } from "jspdf";

interface Mistake {
  id: number;
  question_id: number;
  last_wrong_answer: string;
  error_count: number;
  created_at: string;
  questions: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
    type: string;
    answer: string;
    subject_id: number;
    options?: any;
    subjects: {
      id: number;
      name: string;
    };
  };
}

interface ExportMistakesModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: Mistake[];
  userId: string;
}

type TimeRange = "all" | "7days" | "30days";
type ExportFormat = "markdown" | "pdf";

export function ExportMistakesModal({
  isOpen,
  onClose,
  mistakes,
  userId,
}: ExportMistakesModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const supabase = createClient();

  if (!isOpen) return null;

  const filterMistakes = () => {
    const now = new Date();
    return mistakes.filter((m) => {
      if (timeRange === "all") return true;
      const created = new Date(m.created_at);
      const diff = now.getTime() - created.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      if (timeRange === "7days") return days <= 7;
      if (timeRange === "30days") return days <= 30;
      return true;
    });
  };

  const filteredMistakes = filterMistakes();

  const generateMarkdown = () => {
    let md = `# Mistake Book\n\n`;
    md += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    md += `Total Mistakes: ${filteredMistakes.length}\n\n---\n\n`;

    filteredMistakes.forEach((m, idx) => {
      md += `## ${idx + 1}. ${m.questions.title}\n\n`;
      md += `**Subject:** ${m.questions.subjects.name}\n`;
      md += `**Difficulty:** ${m.questions.difficulty}\n`;
      md += `**Error Count:** ${m.error_count}\n\n`;
      md += `### Question\n${m.questions.content}\n\n`;

      // Add options if available
      if (m.questions.options && Array.isArray(m.questions.options)) {
        md += `### Options\n`;
        m.questions.options.forEach((opt: any) => {
          const isCorrect = opt.label === m.questions.answer;
          const isSelected = opt.label === m.last_wrong_answer;
          let prefix = "- [ ]";
          if (isCorrect) prefix = "- [x] (Correct)";
          else if (isSelected) prefix = "- [x] (Your Answer)";

          md += `${prefix} ${opt.label}. ${opt.content}\n`;
        });
        md += `\n`;
      }

      md += `### Your Answer\n${m.last_wrong_answer || "(No answer)"}\n\n`;
      md += `### Correct Answer\n${m.questions.answer}\n\n`;
      md += `---\n\n`;
    });

    return md;
  };

  const exportMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mistakes-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(20);
    doc.text("Mistake Book", margin, y);
    y += 15;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y);
    y += 8;
    doc.text(`Total Mistakes: ${filteredMistakes.length}`, margin, y);
    y += 15;

    doc.setFontSize(12);

    filteredMistakes.forEach((m, idx) => {
      // Check if we need a new page
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${m.questions.title}`, margin, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Subject: ${m.questions.subjects.name} | Difficulty: ${m.questions.difficulty}`,
        margin,
        y
      );
      y += lineHeight;

      // Content
      const contentLines = doc.splitTextToSize(
        m.questions.content,
        pageWidth - 2 * margin
      );
      contentLines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
      y += 3;

      // Options
      if (m.questions.options && Array.isArray(m.questions.options)) {
        doc.setFont("courier", "normal");
        m.questions.options.forEach((opt: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }

          // Simple option text
          const optionText = `${opt.label}. ${opt.content}`;
          // Handle long options
          const optLines = doc.splitTextToSize(
            optionText,
            pageWidth - 2 * margin
          );
          optLines.forEach((line: string) => {
            doc.text(line, margin, y);
            y += lineHeight;
          });
        });
        y += 3;
        doc.setFont("helvetica", "normal");
      }

      doc.setTextColor(255, 0, 0);
      doc.text(
        `Your Answer: ${m.last_wrong_answer || "(No answer)"}`,
        margin,
        y
      );
      y += lineHeight;

      doc.setTextColor(0, 128, 0);
      doc.text(`Correct Answer: ${m.questions.answer}`, margin, y);
      y += lineHeight + 5;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
    });

    doc.save(`mistakes-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      if (format === "markdown") {
        exportMarkdown();
      } else {
        exportPDF();
      }
      setIsExporting(false);
    }, 100);
  };

  const generateShareLink = async () => {
    setIsGeneratingLink(true);

    const shareId = crypto.randomUUID();
    const mistakeIds = filteredMistakes.map((m) => m.id);

    await supabase.from("shared_mistakes").insert({
      share_id: shareId,
      user_id: userId,
      mistake_ids: mistakeIds,
      title: `Mistake Book (${filteredMistakes.length} items)`,
    } as any);

    const link = `${window.location.origin}/shared/mistakes/${shareId}`;
    setShareLink(link);
    setIsGeneratingLink(false);
  };

  const copyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Export Mistakes</h2>

        {/* Time Range */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            <Calendar className="size-4 inline mr-1" />
            Time Range
          </label>
          <div className="flex gap-2">
            {[
              { value: "all", label: "All" },
              { value: "7days", label: "Last 7 Days" },
              { value: "30days", label: "Last 30 Days" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as TimeRange)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  timeRange === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {filteredMistakes.length} mistakes selected
          </p>
        </div>

        {/* Format */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            <FileText className="size-4 inline mr-1" />
            Format
          </label>
          <div className="flex gap-2">
            {[
              { value: "markdown", label: "Markdown (.md)" },
              { value: "pdf", label: "PDF" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormat(option.value as ExportFormat)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                  format === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || filteredMistakes.length === 0}
          className="w-full mb-4"
        >
          {isExporting ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Download className="size-4 mr-2" />
          )}
          Download {format.toUpperCase()}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Share Link */}
        {shareLink ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                onClick={copyLink}
                className="p-2 hover:bg-gray-200 rounded"
              >
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Anyone with this link can view your mistakes
            </p>
          </div>
        ) : (
          <Button
            variant="secondary"
            onClick={generateShareLink}
            disabled={isGeneratingLink || filteredMistakes.length === 0}
            className="w-full"
          >
            {isGeneratingLink ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="size-4 mr-2" />
            )}
            Generate Share Link
          </Button>
        )}
      </div>
    </div>
  );
}
