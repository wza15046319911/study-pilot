"use client";

import { useEffect, useState } from "react";
import { Subject, Topic } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { X, Save, Layers, ListFilter } from "lucide-react";
import { upsertSubject } from "../actions";
import { useRouter } from "next/navigation";
import { TopicManager } from "./TopicManager";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: Subject;
  topics: Topic[];
}

export function SubjectModal({
  isOpen,
  onClose,
  subject,
  topics,
}: SubjectModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "topics">("general");
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [category, setCategory] = useState("");
  const [isHot, setIsHot] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Reset form when modal opens/closes or subject changes
  useEffect(() => {
    if (isOpen) {
      if (subject) {
        setName(subject.name);
        setSlug(subject.slug || "");
        setDescription(subject.description || "");
        setIcon(subject.icon || "");
        setCategory(subject.category || "");
        setIsHot(subject.is_hot || false);
        setIsNew(subject.is_new || false);
        setActiveTab("general");
      } else {
        // New subject
        setName("");
        setSlug("");
        setDescription("");
        setIcon("");
        setCategory("");
        setIsHot(false);
        setIsNew(false);
        setActiveTab("general");
      }
    }
  }, [isOpen, subject]);

  // Auto-generate slug from name if not manually edited (simplified: always update if new)
  // Or: Provide a helper to slugify
  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!subject) {
      // Only auto-generate for new subjects for better UX
      setSlug(generateSlug(newName));
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    setLoading(true);
    try {
      await upsertSubject({
        id: subject?.id, // undefined for new
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"), // Fallback
        description: description || null,
        icon: icon || null,
        category: category || null,
        is_hot: isHot,
        is_new: isNew,
      });
      router.refresh();
      onClose();
    } catch (error) {
      alert("Failed to save subject: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassPanel className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-slate-900/90">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold dark:text-white">
            {subject ? "Edit Subject" : "Create New Subject"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "general"
                ? "text-[#135bec] border-b-2 border-[#135bec] bg-blue-50/30 dark:bg-blue-900/10"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <Layers className="size-4" /> General Info
          </button>
          <button
            onClick={() => setActiveTab("topics")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "topics"
                ? "text-[#135bec] border-b-2 border-[#135bec] bg-blue-50/30 dark:bg-blue-900/10"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
            disabled={!subject} // Cannot add topics to a non-existent subject
            title={!subject ? "Save subject first to manage topics" : ""}
          >
            <ListFilter className="size-4" /> Topics
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "general" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Mathematics"
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug (URL Friendly ID)
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. mathematics"
                  className="bg-white dark:bg-slate-900 font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the subject..."
                  className="w-full min-h-[80px] p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] text-sm dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Icon (Emoji/String)
                  </label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. 📐"
                    className="bg-white dark:bg-slate-900"
                  />
                  <p className="text-xs text-gray-500">
                    Currently using simple strings/emojis for icons.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Science"
                    className="bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHot}
                    onChange={(e) => setIsHot(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-[#135bec] focus:ring-[#135bec]"
                  />
                  <span className="text-sm font-medium dark:text-white">
                    Mark as HOT 🔥
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-[#135bec] focus:ring-[#135bec]"
                  />
                  <span className="text-sm font-medium dark:text-white">
                    Mark as NEW ✨
                  </span>
                </label>
              </div>

              {!subject && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg">
                  You can add topics after saving the subject.
                </div>
              )}
            </div>
          ) : (
            <div>
              {subject ? (
                <TopicManager subjectId={subject.id} initialTopics={topics} />
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Please save the subject first.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {activeTab === "general" && (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#135bec] text-white"
            >
              <Save className="mr-2 size-4" /> Save Subject
            </Button>
          )}
          {activeTab === "topics" && (
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
