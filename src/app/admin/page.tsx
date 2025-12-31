import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Upload,
  FileText,
  Settings,
  Users,
  BarChart3,
  BookOpen,
} from "lucide-react";

export default function AdminDashboard() {
  const adminLinks = [
    {
      title: "Upload Questions",
      description: "Batch upload questions parsed from text.",
      href: "/admin/upload-question",
      icon: <Upload className="size-8 text-blue-500" />,
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Manage Subjects",
      description: "Create and organize subjects and topics.",
      href: "/admin/subjects",
      icon: <BookOpen className="size-8 text-purple-500" />,
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Question Manager",
      description: "Edit, tag, and delete existing questions.",
      href: "/admin/questions",
      icon: <FileText className="size-8 text-purple-500" />,
      color: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Exam Manager",
      description: "Create and manage practice exams.",
      href: "/admin/exams", // Assuming this exists or will exist
      icon: <Settings className="size-8 text-amber-500" />,
      color: "bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-[#4c669a]">
          Manage content, users, and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block group">
            <GlassPanel className="p-6 h-full transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div
                  className={`flex items-center justify-center size-14 rounded-xl ${link.color}`}
                >
                  {link.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d121b] dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-[#4c669a] dark:text-gray-400">
                    {link.description}
                  </p>
                </div>
              </div>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
