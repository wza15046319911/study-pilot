"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  X,
  Eye,
  Filter,
} from "lucide-react";

interface Feedback {
  id: number;
  question_id: number;
  user_id: string;
  feedback_type: "error" | "too_hard" | "duplicate";
  comment: string | null;
  status: "pending" | "reviewed" | "fixed" | "dismissed";
  created_at: string;
  questions: {
    id: number;
    title: string;
    content: string;
    subject_id: number;
    subjects: {
      id: number;
      name: string;
    };
  };
}

interface FeedbackClientProps {
  feedback: Feedback[];
}

const statusOptions = ["pending", "reviewed", "fixed", "dismissed"] as const;

const feedbackTypeIcons = {
  error: <AlertTriangle className="size-4 text-red-500" />,
  too_hard: <HelpCircle className="size-4 text-yellow-500" />,
  duplicate: <Copy className="size-4 text-blue-500" />,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewed: "bg-blue-100 text-blue-700",
  fixed: "bg-green-100 text-green-700",
  dismissed: "bg-gray-100 text-gray-700",
};

export default function FeedbackClient({ feedback }: FeedbackClientProps) {
  const [items, setItems] = useState(feedback);
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const supabase = createClient();

  const updateStatus = async (
    id: number,
    newStatus: "pending" | "reviewed" | "fixed" | "dismissed"
  ) => {
    await (supabase as any)
      .from("question_feedback")
      .update({ status: newStatus })
      .eq("id", id);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  const filteredItems = items.filter((item) => {
    if (filter !== "all" && item.status !== filter) return false;
    if (typeFilter !== "all" && item.feedback_type !== typeFilter) return false;
    return true;
  });

  const counts = {
    pending: items.filter((i) => i.status === "pending").length,
    reviewed: items.filter((i) => i.status === "reviewed").length,
    fixed: items.filter((i) => i.status === "fixed").length,
    dismissed: items.filter((i) => i.status === "dismissed").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Question Feedback</h1>
        <p className="text-gray-500">
          Review and manage user-reported issues with questions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? "all" : status)}
            className={`p-4 rounded-xl border-2 transition-all ${
              filter === status
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold">{counts[status]}</p>
            <p className="text-sm text-gray-500 capitalize">{status}</p>
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-6">
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="size-4" />
          Type:
        </span>
        {["all", "error", "too_hard", "duplicate"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              typeFilter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type === "all" ? "All" : type.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <GlassPanel className="p-8 text-center text-gray-500">
            No feedback found matching your filters
          </GlassPanel>
        ) : (
          filteredItems.map((item) => (
            <GlassPanel key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {feedbackTypeIcons[item.feedback_type]}
                    <span className="font-semibold">
                      {item.questions.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      #{item.question_id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.questions.content.slice(0, 150)}...
                  </p>
                  {item.comment && (
                    <p className="text-sm bg-gray-50 p-2 rounded mb-2 italic">
                      "{item.comment}"
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{item.questions.subjects.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[item.status]
                    }`}
                  >
                    {item.status}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateStatus(item.id, "reviewed")}
                      className="p-1.5 hover:bg-blue-50 rounded"
                      title="Mark as reviewed"
                    >
                      <Eye className="size-4 text-blue-500" />
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, "fixed")}
                      className="p-1.5 hover:bg-green-50 rounded"
                      title="Mark as fixed"
                    >
                      <Check className="size-4 text-green-500" />
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, "dismissed")}
                      className="p-1.5 hover:bg-gray-100 rounded"
                      title="Dismiss"
                    >
                      <X className="size-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))
        )}
      </div>
    </div>
  );
}
