"use client";

import { useState, useEffect } from "react";
import { SubjectExamDate } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Calendar, Trash2, Save } from "lucide-react";
import { upsertSubjectExamDate, deleteSubjectExamDate } from "../actions";
import { useRouter } from "next/navigation";

type StudentLevel = "undergraduate" | "postgraduate";

const STUDENT_LEVEL_LABELS: Record<StudentLevel, string> = {
  undergraduate: "本科生",
  postgraduate: "研究生",
};

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

  const getExamDate = (
    type: "midterm" | "final",
    studentLevel: StudentLevel
  ) => {
    return initialExamDates.find(
      (d) =>
        d.exam_type === type &&
        (d.student_level ?? "undergraduate") === studentLevel
    );
  };

  // Helper to convert UTC date string to local datetime-local string
  const toLocalISO = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  // Local state for inputs: key = "midterm_undergraduate" etc.
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const examTypes = ["midterm", "final"] as const;
  const studentLevels: StudentLevel[] = ["undergraduate", "postgraduate"];

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const type of examTypes) {
      for (const level of studentLevels) {
        const d = initialExamDates.find(
          (x) =>
            x.exam_type === type &&
            (x.student_level ?? "undergraduate") === level
        );
        next[`${type}_${level}`] = d ? toLocalISO(d.exam_date) : "";
      }
    }
    setInputs((prev) => ({ ...prev, ...next }));
  }, [initialExamDates]);

  const handleSave = async (
    type: "midterm" | "final",
    studentLevel: StudentLevel,
    dateValue: string
  ) => {
    if (!dateValue) return;

    setLoading(true);
    try {
      const date = new Date(dateValue);
      await upsertSubjectExamDate({
        subject_id: subjectId,
        exam_type: type,
        exam_date: date.toISOString(),
        student_level: studentLevel,
      });
      router.refresh();
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

  const ExamRow = ({
    type,
    studentLevel,
    iconBg,
  }: {
    type: "midterm" | "final";
    studentLevel: StudentLevel;
    iconBg: string;
  }) => {
    const key = `${type}_${studentLevel}`;
    const examDate = getExamDate(type, studentLevel);
    const inputVal = inputs[key] ?? "";

    return (
      <div className="flex items-center gap-3 py-2">
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className={`p-1.5 rounded ${iconBg}`}>
            <Calendar className="size-4" />
          </div>
          <span className="text-sm font-medium dark:text-white">
            {STUDENT_LEVEL_LABELS[studentLevel]}
          </span>
        </div>
        <Input
          type="datetime-local"
          value={inputVal}
          onChange={(e) =>
            setInputs((p) => ({ ...p, [key]: e.target.value }))
          }
          className="flex-1 bg-gray-50 dark:bg-slate-800"
        />
        <Button
          onClick={() => handleSave(type, studentLevel, inputVal)}
          disabled={
            loading ||
            !inputVal ||
            (examDate && toLocalISO(examDate.exam_date) === inputVal)
          }
          className="bg-[#135bec] text-white whitespace-nowrap shrink-0"
        >
          <Save className="size-4 mr-2" /> Save
        </Button>
        {examDate && (
          <button
            onClick={() => handleDelete(examDate.id)}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
            title="Remove date"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Calendar className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold dark:text-white">Midterm Exam</h3>
            <p className="text-xs text-gray-500">
              Usually halfway through the semester
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <ExamRow
            type="midterm"
            studentLevel="undergraduate"
            iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          <ExamRow
            type="midterm"
            studentLevel="postgraduate"
            iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
        </div>
      </div>

      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Calendar className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold dark:text-white">Final Exam</h3>
            <p className="text-xs text-gray-500">
              The end of semester assessment
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <ExamRow
            type="final"
            studentLevel="undergraduate"
            iconBg="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />
          <ExamRow
            type="final"
            studentLevel="postgraduate"
            iconBg="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm rounded-lg">
        <Calendar className="size-5 shrink-0 mt-0.5" />
        <p>
          Setting these dates will enable the &quot;Exam Countdown&quot; feature
          on the subject page. Students will see countdown timers for both
          undergraduate and postgraduate exams.
        </p>
      </div>
    </div>
  );
}
