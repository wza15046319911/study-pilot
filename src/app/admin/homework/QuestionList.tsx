import { memo } from "react";
import { Question } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { LatexContent } from "@/components/ui/LatexContent";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Plus, Trash2 } from "lucide-react";

interface QuestionListProps {
  questions: Question[];
  onAction: (question: Question) => void;
  onPreview: (question: Question) => void;
  actionIcon: "plus" | "trash";
  emptyMessage: string;
  loading?: boolean;
}

const QuestionList = memo(function QuestionList({
  questions,
  onAction,
  onPreview,
  actionIcon,
  emptyMessage,
  loading,
}: QuestionListProps) {
  if (loading) {
    return <div className="text-sm text-slate-500">Loading...</div>;
  }

  if (questions.length === 0) {
    return <div className="text-sm text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className={`p-3 rounded-lg border border-slate-200 dark:border-slate-800 ${
            actionIcon === "plus"
              ? "hover:border-blue-400 transition-colors"
              : "bg-slate-50/60 dark:bg-slate-900/40"
          } cursor-pointer`}
          onClick={() => onPreview(question)}
        >
          <div className="flex justify-between items-start gap-3">
            <div className="text-sm text-slate-700 dark:text-slate-200 break-words w-full">
              {actionIcon === "trash" && (
                <span className="mr-2 text-xs text-slate-400">
                  #{index + 1}
                </span>
              )}
              <LatexContent content={question.content} />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onAction(question);
              }}
            >
              {actionIcon === "plus" ? (
                <Plus className="size-4" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </div>
          {Array.isArray(question.options) && question.options.length > 0 && (
            <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
              {(question.options as any[]).map((opt, idx) => (
                <div key={`${question.id}-opt-${idx}`} className="flex gap-2">
                  <span className="font-semibold">{opt.label}.</span>
                  <div className="break-words">
                    <LatexContent content={opt.content} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {question.code_snippet && (
            <div className="mt-2 text-xs text-slate-500">
              <CodeBlock code={question.code_snippet} language="c" />
            </div>
          )}
          <button
            className="text-xs text-blue-600 mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(question);
            }}
          >
            Preview
          </button>
        </div>
      ))}
    </div>
  );
});

export default QuestionList;
