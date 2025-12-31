"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, Loader2 } from "lucide-react";

interface MistakeData {
  id: number;
  question_id: number;
  last_wrong_answer: string | null;
  error_count: number;
  created_at: string;
  questions: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
    type: string;
    answer: string;
    explanation?: string | null;
    code_snippet?: string | null;
    options?: { label: string; content: string }[] | null;
  };
}

interface PDFExportButtonProps {
  mistakes: MistakeData[];
  username?: string;
}

export function PDFExportButton({ mistakes, username }: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      // Dynamically import react-pdf only when needed
      const { pdf } = await import("@react-pdf/renderer");
      const { MistakesPDF } = await import("@/components/export/MistakesPDF");

      // Transform data for PDF
      const pdfData = mistakes.map((m) => ({
        ...m,
        // Add missing fields with defaults for PDF display
        user_id: "",
        error_type: null,
        last_error_at: m.created_at,
        questions: m.questions as any,
      }));

      // Generate PDF blob
      const blob = await pdf(
        <MistakesPDF mistakes={pdfData as any} username={username} />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mistakes-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button variant="secondary" onClick={handleExport} disabled={isGenerating}>
      {isGenerating ? (
        <Loader2 className="size-4 mr-2 animate-spin" />
      ) : (
        <Download className="size-4 mr-2" />
      )}
      {isGenerating ? "Generating..." : "Export PDF"}
    </Button>
  );
}
