"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flag, AlertTriangle, HelpCircle, Copy, X, Check } from "lucide-react";

interface FeedbackButtonProps {
  questionId: number;
  userId: string;
}

type FeedbackType = "error" | "too_hard" | "duplicate";

const feedbackOptions: {
  type: FeedbackType;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "error",
    label: "Report Error",
    icon: <AlertTriangle className="size-4" />,
  },
  {
    type: "too_hard",
    label: "Too Difficult",
    icon: <HelpCircle className="size-4" />,
  },
  {
    type: "duplicate",
    label: "Duplicate Question",
    icon: <Copy className="size-4" />,
  },
];

export function FeedbackButton({ questionId, userId }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);

  const handleSubmit = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);
    const supabase = createClient();

    await supabase.from("question_feedback").insert({
      question_id: questionId,
      user_id: userId,
      feedback_type: selectedType,
      comment: comment.trim() || null,
    } as any);

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setSelectedType(null);
      setComment("");
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Check className="size-4" />
        <span>Thank you!</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Report issue"
      >
        <Flag className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Report Issue</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-2 mb-3">
            {feedbackOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedType === option.type
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>

          {selectedType && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add details (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 mb-3 resize-none"
              rows={2}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedType || isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      )}
    </div>
  );
}
