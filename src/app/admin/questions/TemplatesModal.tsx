"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, FileText, Plus, Trash2, Download, Save } from "lucide-react";

interface QuestionTemplate {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  contentStructure: string;
  tags: string[];
  createdAt: string;
}

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: QuestionTemplate) => void;
  currentData?: {
    type: string;
    difficulty: string;
    content: string;
    tags: string[];
  };
}

const TEMPLATES_KEY = "question-templates";

export default function TemplatesModal({
  isOpen,
  onClose,
  onLoadTemplate,
  currentData,
}: TemplatesModalProps) {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [activeTab, setActiveTab] = useState<"load" | "save">("load");

  // Load templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }, [isOpen]);

  const saveTemplates = (updated: QuestionTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim() || !currentData) return;

    const template: QuestionTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      type: currentData.type,
      difficulty: currentData.difficulty,
      contentStructure: currentData.content,
      tags: currentData.tags,
      createdAt: new Date().toISOString(),
    };

    saveTemplates([...templates, template]);
    setNewTemplateName("");
    setActiveTab("load");
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm("Delete this template?")) return;
    saveTemplates(templates.filter((t) => t.id !== id));
  };

  const handleLoadTemplate = (template: QuestionTemplate) => {
    onLoadTemplate(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-blue-500" />
                <h2 className="text-lg font-bold text-[#0d121b] dark:text-white">
                  Question Templates
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("load")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "load"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Download className="size-4 inline mr-1" />
                Load Template
              </button>
              <button
                onClick={() => setActiveTab("save")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "save"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Save className="size-4 inline mr-1" />
                Save as Template
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "load" ? (
                templates.length > 0 ? (
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          <p className="font-medium text-[#0d121b] dark:text-white">
                            {template.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {template.type} • {template.difficulty}
                            {template.tags.length > 0 &&
                              ` • ${template.tags.slice(0, 2).join(", ")}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="size-12 mx-auto mb-4 opacity-50" />
                    <p>No templates saved yet</p>
                    <p className="text-sm">Save a template to reuse it later</p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {currentData ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Template Name
                        </label>
                        <Input
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          placeholder="e.g., Python MCQ Template"
                        />
                      </div>

                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-sm">
                        <p className="text-gray-500 mb-2">
                          This template will include:
                        </p>
                        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                          <li>• Type: {currentData.type}</li>
                          <li>• Difficulty: {currentData.difficulty}</li>
                          <li>
                            • Tags:{" "}
                            {currentData.tags.length > 0
                              ? currentData.tags.join(", ")
                              : "None"}
                          </li>
                          <li>• Content structure (first 100 chars)</li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleSaveTemplate}
                        disabled={!newTemplateName.trim()}
                        className="w-full"
                      >
                        <Plus className="size-4 mr-1" />
                        Save Template
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p>Open a question to save as template</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
