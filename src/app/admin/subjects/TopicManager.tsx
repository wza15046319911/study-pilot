"use client";

import { useState } from "react";
import { Topic } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Save, X, Pencil } from "lucide-react";
import { upsertTopic, deleteTopic } from "../actions";
import { useRouter } from "next/navigation";

interface TopicManagerProps {
  subjectId: number;
  initialTopics: Topic[];
}

export function TopicManager({ subjectId, initialTopics }: TopicManagerProps) {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [isAdding, setIsAdding] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicSlug, setNewTopicSlug] = useState("");
  const [loading, setLoading] = useState(false);

  // For editing inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNewNameChange = (val: string) => {
    setNewTopicName(val);
    setNewTopicSlug(generateSlug(val));
  };

  const handleAddParams = () => {
    setIsAdding(true);
    setNewTopicName("");
    setNewTopicSlug("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewTopicName("");
    setNewTopicSlug("");
  };

  const handleSaveNew = async () => {
    if (!newTopicName.trim()) return;
    setLoading(true);
    try {
      await upsertTopic({
        subject_id: subjectId,
        name: newTopicName,
        slug: newTopicSlug || generateSlug(newTopicName),
      });
      setIsAdding(false);
      setNewTopicName("");
      setNewTopicSlug("");
      router.refresh();
    } catch (error) {
      alert("Failed to add topic: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topic: Topic) => {
    setEditingId(topic.id);
    setEditName(topic.name);
    setEditSlug(topic.slug || "");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      await upsertTopic({
        id,
        subject_id: subjectId,
        name: editName,
        slug: editSlug || generateSlug(editName),
      });
      setEditingId(null);
      router.refresh();
    } catch (error) {
      alert("Failed to update topic: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;
    setLoading(true);
    try {
      await deleteTopic(id);
      router.refresh();
    } catch (error) {
      alert("Failed to delete topic: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Topics</h3>
        <Button
          size="sm"
          onClick={handleAddParams}
          disabled={isAdding || loading}
        >
          <Plus className="size-4 mr-1" /> Add Topic
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {isAdding && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                value={newTopicName}
                onChange={(e) => handleNewNameChange(e.target.value)}
                placeholder="Topic Name"
                className="h-9 bg-white dark:bg-slate-900"
                autoFocus
              />
              <Input
                value={newTopicSlug}
                onChange={(e) => setNewTopicSlug(e.target.value)}
                placeholder="slug-url"
                className="h-9 bg-white dark:bg-slate-900 font-mono text-xs"
              />
            </div>
            <Button size="sm" onClick={handleSaveNew} disabled={loading}>
              <Save className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCancelAdd}
              disabled={loading}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        {topics.length === 0 && !isAdding && (
          <p className="text-sm text-gray-500 text-center py-4 italic">
            No topics found. Add one to get started.
          </p>
        )}

        {/* Since initialTopics is prop, and router.refresh updates the parent page which re-renders SubjectsClient -> SubjectModal -> TopicManager, 
            we need to rely on the prop updating. 
            However, usually inline edits might want optimistic UI. 
            For simplicity with router.refresh, we trust the prop update.
        */}
        {initialTopics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 transition-colors"
          >
            {editingId === topic.id ? (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 bg-white dark:bg-slate-900"
                    autoFocus
                  />
                  <Input
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="h-9 bg-white dark:bg-slate-900 font-mono text-xs"
                    placeholder="slug"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(topic.id)}
                  disabled={loading}
                >
                  <Save className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingId(null)}
                  disabled={loading}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{topic.name}</span>
                  <span className="text-xs text-gray-400 font-mono">
                    /{topic.slug}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(topic)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
