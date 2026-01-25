"use client";

import { useState, useEffect } from "react";
import { SubjectExamDate } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Calendar, Trash2, Save } from "lucide-react";
import { upsertSubjectExamDate, deleteSubjectExamDate } from "../actions";
import { useRouter } from "next/navigation";

interface ExamDateManagerProps {
  subjectId: number;
  initialExamDates: SubjectExamDate[];
}

export function ExamDateManager({
  subjectId,
  initialExamDates,
}: ExamDateManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getExamDate = (type: "midterm" | "final") => {
    return initialExamDates.find((d) => d.exam_type === type);
  };

  const midtermDate = getExamDate("midterm");
  const finalDate = getExamDate("final");

  // Helper to convert UTC date string to local datetime-local string
  const toLocalISO = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    // Get local time components
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  // Local state for inputs
  const [midtermInput, setMidtermInput] = useState("");
  const [finalInput, setFinalInput] = useState("");

  useEffect(() => {
    setMidtermInput(midtermDate ? toLocalISO(midtermDate.exam_date) : "");
  }, [midtermDate]);

  useEffect(() => {
    setFinalInput(finalDate ? toLocalISO(finalDate.exam_date) : "");
  }, [finalDate]);

  const handleSave = async (type: "midterm" | "final", dateValue: string) => {
    if (!dateValue) return;
    
    setLoading(true);
    try {
      // Create date object from local time input
      const date = new Date(dateValue);
      await upsertSubjectExamDate({
        subject_id: subjectId,
        exam_type: type,
        exam_date: date.toISOString(),
      });
      router.refresh();
      // alert(`Saved ${type} exam date!`);
    } catch (error) {
      alert("Failed to save: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this exam date?")) return;
    
    setLoading(true);
    try {
      await deleteSubjectExamDate(id);
      router.refresh();
    } catch (error) {
      alert("Failed to delete: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">Midterm Exam</h3>
              <p className="text-xs text-gray-500">Usually halfway through the semester</p>
            </div>
          </div>
          {midtermDate && (
            <button 
              onClick={() => handleDelete(midtermDate.id)}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Remove date"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            value={midtermInput}
            onChange={(e) => setMidtermInput(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-slate-800"
          />
          <Button 
            onClick={() => handleSave("midterm", midtermInput)}
            disabled={loading || !midtermInput || (midtermDate && toLocalISO(midtermDate.exam_date) === midtermInput)}
            className="bg-[#135bec] text-white whitespace-nowrap"
          >
            <Save className="size-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold dark:text-white">Final Exam</h3>
              <p className="text-xs text-gray-500">The end of semester assessment</p>
            </div>
          </div>
          {finalDate && (
             <button 
              onClick={() => handleDelete(finalDate.id)}
              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Remove date"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            value={finalInput}
            onChange={(e) => setFinalInput(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-slate-800"
          />
          <Button 
            onClick={() => handleSave("final", finalInput)}
            disabled={loading || !finalInput || (finalDate && toLocalISO(finalDate.exam_date) === finalInput)}
            className="bg-[#135bec] text-white whitespace-nowrap"
          >
            <Save className="size-4 mr-2" /> Save
          </Button>
        </div>
      </div>
      
      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm rounded-lg">
        <Calendar className="size-5 shrink-0 mt-0.5" />
        <p>
          Setting these dates will enable the "Exam Countdown" feature on the subject page.
          Students will see a countdown timer creating a sense of urgency.
        </p>
      </div>
    </div>
  );
}
