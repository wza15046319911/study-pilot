"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createQuestionBank, updateQuestionBank } from "./actions";
import { QuestionPickerPanel } from "@/components/admin/question-picker/QuestionPickerPanel";
import type { QuestionPoolListItem } from "@/lib/actions/questionPool";
import {
  ChevronLeft,
  Save,
  Send,
  Lock,
  Globe,
  Gift,
  DollarSign,
  ListChecks,
  Brain,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

interface Subject {
  id: number;
  name: string;
}

interface BankBuilderProps {
  subjects: Subject[];
  initialData?: {
    id?: number;
    subject_id?: number;
    title?: string;
    slug?: string;
    description?: string;
    unlock_type?: "free" | "premium" | "referral" | "paid";
    price?: number | null;
    allowed_modes?: string[];
    visibility?: "public" | "assigned_only";
    questions?: QuestionPoolListItem[];
  };
}

export default function BankBuilder({
  subjects,
  initialData,
}: BankBuilderProps) {
  const router = useRouter();

  // Form State
  const [subjectId, setSubjectId] = useState<string>(
    initialData?.subject_id?.toString() || "",
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [unlockType, setUnlockType] = useState<
    "free" | "premium" | "referral" | "paid"
  >(initialData?.unlock_type || "free");
  const [price, setPrice] = useState<string>(
    initialData?.price?.toString() || "",
  );
  const [allowedModes, setAllowedModes] = useState<string[]>(
    initialData?.allowed_modes || ["standard", "immersive", "flashcard"],
  );
  const [visibility, setVisibility] = useState<"public" | "assigned_only">(
    initialData?.visibility || "public",
  );

  // Toggle helper for practice modes
  const toggleMode = (mode: string) => {
    setAllowedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Data State
  const [selectedQuestions, setSelectedQuestions] = useState<
    QuestionPoolListItem[]
  >(
    initialData?.questions || [],
  );
  const [saving, setSaving] = useState(false);
  const selectedSubjectId = subjectId ? Number.parseInt(subjectId, 10) : null;

  const saveBank = async (publish: boolean) => {
    if (!subjectId || !title.trim() || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select questions.");
      return;
    }

    if (allowedModes.length === 0) {
      alert("Please select at least one practice mode.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        subjectId: parseInt(subjectId),
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        unlockType,
        price: unlockType === "paid" ? parseFloat(price) || null : null,
        allowedModes,
        visibility,
        isPublished: publish,
        questionIds: selectedQuestions.map((q) => q.id),
      };

      if (initialData?.id != null) {
        await updateQuestionBank({
          ...payload,
          bankId: initialData.id,
        });
      } else {
        await createQuestionBank(payload);
      }

      router.push("/admin/question-banks");
    } catch (error) {
      console.error(error);
      alert("Failed to save question bank.");
      setSaving(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/question-banks"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="size-6 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Question Bank" : "Create Question Bank"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Curate questions for focused practice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
        {/* Left Panel - Configuration & Selection */}
        <div className="space-y-6">
          <GlassPanel className="p-6">
            <h2 className="text-lg font-bold mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Subject *
                </label>
                <Select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    if (!initialData) setSelectedQuestions([]);
                  }}
                  options={subjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  placeholder="Select Subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!initialData) {
                      setSlug(generateSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g. Calculus I - Derivatives Mastery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Slug *
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  placeholder="e.g. calculus-derivatives-mastery"
                />
                <p className="text-xs text-slate-400 mt-1">
                  URL-friendly identifier (auto-generated from title)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this question bank"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Access Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "free"
                        ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "free"}
                      onChange={() => setUnlockType("free")}
                      className="size-4 text-green-600 focus:ring-green-500"
                    />
                    <Globe className="size-5 text-green-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Free Access
                      </span>
                      <span className="text-xs text-slate-400">
                        All users can access
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "premium"
                        ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "premium"}
                      onChange={() => setUnlockType("premium")}
                      className="size-4 text-amber-600 focus:ring-amber-500"
                    />
                    <Lock className="size-5 text-amber-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        VIP Premium
                      </span>
                      <span className="text-xs text-slate-400">
                        VIP members only
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "referral"
                        ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "referral"}
                      onChange={() => setUnlockType("referral")}
                      className="size-4 text-purple-600 focus:ring-purple-500"
                    />
                    <Gift className="size-5 text-purple-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Referral Unlock
                      </span>
                      <span className="text-xs text-slate-400">
                        Users earn access by inviting friends
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      unlockType === "paid"
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="unlockType"
                      checked={unlockType === "paid"}
                      onChange={() => setUnlockType("paid")}
                      className="size-4 text-blue-600 focus:ring-blue-500"
                    />
                    <DollarSign className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Paid (Purchase Required)
                      </span>
                      <span className="text-xs text-slate-400">
                        Must be purchased, even by VIP users
                      </span>
                    </div>
                  </label>

                  {unlockType === "paid" && (
                    <div className="mt-3 pl-8">
                      <label className="block text-sm font-medium text-slate-500 mb-2">
                        Price (AUD)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 9.99"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Practice Modes */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Allowed Practice Modes *
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      allowedModes.includes("standard")
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModes.includes("standard")}
                      onChange={() => toggleMode("standard")}
                      className="size-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <ListChecks className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Standard
                      </span>
                      <span className="text-xs text-slate-400">
                        Practice with custom filters, track progress
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      allowedModes.includes("immersive")
                        ? "border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModes.includes("immersive")}
                      onChange={() => toggleMode("immersive")}
                      className="size-4 text-violet-600 focus:ring-violet-500 rounded"
                    />
                    <Brain className="size-5 text-violet-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Immersive
                      </span>
                      <span className="text-xs text-slate-400">
                        Focused, distraction-free practice
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      allowedModes.includes("flashcard")
                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedModes.includes("flashcard")}
                      onChange={() => toggleMode("flashcard")}
                      className="size-4 text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <GraduationCap className="size-5 text-emerald-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Flashcard
                      </span>
                      <span className="text-xs text-slate-400">
                        Spaced repetition review
                      </span>
                    </div>
                  </label>
                </div>
                {allowedModes.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    At least one mode is required
                  </p>
                )}
              </div>

              {/* Visibility */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-500 mb-3">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      visibility === "public"
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                      className="size-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Eye className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">Public</span>
                      <span className="text-xs text-slate-400">
                        Visible in library
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-[background-color,border-color,color] ${
                      visibility === "assigned_only"
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "assigned_only"}
                      onChange={() => setVisibility("assigned_only")}
                      className="size-4 text-blue-600 focus:ring-blue-500"
                    />
                    <EyeOff className="size-5 text-blue-500" />
                    <div className="flex-1">
                      <span className="font-medium text-sm block">
                        Assigned Only
                      </span>
                      <span className="text-xs text-slate-400">
                        Only for specific users
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Questions
              </h2>
              <div className="text-xs text-slate-500">
                {selectedQuestions.length} selected
              </div>
            </div>
            <QuestionPickerPanel
              subjectId={selectedSubjectId}
              selectedQuestions={selectedQuestions}
              onSelectedQuestionsChange={setSelectedQuestions}
            />
          </GlassPanel>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => saveBank(false)}
              disabled={saving || selectedQuestions.length === 0}
            >
              <Save className="size-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={() => saveBank(true)}
              disabled={saving || selectedQuestions.length === 0}
            >
              <Send className="size-4 mr-2" />
              Publish Bank
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
