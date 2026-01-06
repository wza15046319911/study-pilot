"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Question } from "@/types/database";
import { pdf } from "@react-pdf/renderer";
import { ExamPdfDocument } from "./ExamPdfDocument";

interface ExportExamButtonProps {
  examId: number;
  examTitle: string;
  examType: string;
  durationMinutes: number;
}

export function ExportExamButton({
  examId,
  examTitle,
  examType,
  durationMinutes,
}: ExportExamButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const supabase = createClient();

      // Fetch exam questions
      const { data: examItems } = await supabase
        .from("exam_questions")
        .select(
          `
          question:questions(*)
        `
        )
        .eq("exam_id", examId)
        .order("order_index", { ascending: true });

      if (!examItems || examItems.length === 0) {
        alert("No questions found for this exam.");
        return;
      }

      const questions = examItems.map(
        (item: any) => item.question
      ) as Question[];

      // Generate PDF Blob
      const blob = await pdf(
        <ExamPdfDocument
          title={examTitle}
          examType={examType}
          durationMinutes={durationMinutes}
          questions={questions}
        />
      ).toBlob();

      // Trigger Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${examTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Exam.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export exam. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="size-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
