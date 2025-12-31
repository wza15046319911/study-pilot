"use client";

import { useState } from "react";
import { Subject, Topic } from "@/types/database";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Pencil,
  Trash2,
  Terminal,
  Code,
  Book,
  Database,
  Globe,
  Cpu,
  Calculator,
} from "lucide-react";
import { SubjectModal } from "./SubjectModal";
import { deleteSubject } from "../actions";
import { useRouter } from "next/navigation";

// Helper to render dynamic icons
const DynamicIcon = ({
  name,
  className,
}: {
  name: string | null;
  className?: string;
}) => {
  if (!name) return <span className={className}>📚</span>;

  // Icon map
  const icons: Record<string, React.ReactNode> = {
    Terminal: <Terminal className={className} />,
    Code: <Code className={className} />,
    Book: <Book className={className} />,
    Database: <Database className={className} />,
    Globe: <Globe className={className} />,
    Cpu: <Cpu className={className} />,
    Calculator: <Calculator className={className} />,
  };

  return icons[name] || <span className={className}>{name}</span>;
};

interface SubjectsClientProps {
  initialSubjects: Subject[];
  initialTopics: Topic[];
}

export function SubjectsClient({
  initialSubjects,
  initialTopics,
}: SubjectsClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(
    undefined
  );

  // We filter topics for the currently editing subject in the modal
  const getSubjectTopics = (subjectId: number) => {
    return initialTopics.filter((t) => t.subject_id === subjectId);
  };

  const handleCreate = () => {
    setEditingSubject(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this subject? This will also delete all topics and questions within it!"
      )
    ) {
      try {
        await deleteSubject(id);
        // Refresh handled by server action revalidatePath, but optimal to refresh router
        router.refresh();
      } catch (error) {
        alert("Failed to delete subject: " + (error as Error).message);
      }
    }
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate} className="bg-[#135bec] text-white">
          <Plus className="mr-2 size-4" /> Add New Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialSubjects.map((subject) => (
          <GlassPanel key={subject.id} className="p-6 relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl text-blue-500 dark:text-blue-400">
                  <DynamicIcon name={subject.icon} className="size-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg dark:text-white">
                    {subject.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-[#4c669a] dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800">
                      ID: {subject.id}
                    </span>
                    <span className="text-xs text-[#4c669a] dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800 font-mono">
                      /{subject.slug}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-[#4c669a] dark:text-gray-400 mb-4 line-clamp-2">
              {subject.description || "No description provided."}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              {subject.is_hot && (
                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded">
                  HOT
                </span>
              )}
              {subject.is_new && (
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 rounded">
                  NEW
                </span>
              )}
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                {getSubjectTopics(subject.id).length} Topics
              </span>
            </div>
          </GlassPanel>
        ))}
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject={editingSubject}
        topics={editingSubject ? getSubjectTopics(editingSubject.id) : []}
      />
    </>
  );
}
