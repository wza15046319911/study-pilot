import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  PlusCircle,
  UploadCloud,
  FileText,
  BookOpen,
  Library,
  GraduationCap,
  ClipboardCheck,
  CalendarCheck,
  MessageSquareWarning,
  Gift,
  KeyRound,
} from "lucide-react";

export default function AdminDashboard() {
  const adminSections = [
    {
      title: "Question Content",
      description: "Create, import, and organize question resources.",
      links: [
        {
          title: "Create Question",
          description: "Create and submit new questions.",
          href: "/admin/create-question",
          icon: <PlusCircle className="size-8 text-blue-500" />,
          color: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: "Upload Questions",
          description: "Batch upload questions parsed from text.",
          href: "/admin/upload-question",
          icon: <UploadCloud className="size-8 text-sky-500" />,
          color: "bg-sky-100 dark:bg-sky-900/30",
        },
        {
          title: "Manage Questions",
          description: "Edit, tag, and maintain existing questions.",
          href: "/admin/questions",
          icon: <FileText className="size-8 text-violet-500" />,
          color: "bg-violet-100 dark:bg-violet-900/30",
        },
        {
          title: "Manage Subjects",
          description: "Create and organize subjects and topics.",
          href: "/admin/subjects",
          icon: <BookOpen className="size-8 text-purple-500" />,
          color: "bg-purple-100 dark:bg-purple-900/30",
        },
      ],
    },
    {
      title: "Assessments",
      description: "Assemble and publish learning and exam sets.",
      links: [
        {
          title: "Question Banks",
          description: "Create and manage custom question banks.",
          href: "/admin/question-banks",
          icon: <Library className="size-8 text-cyan-500" />,
          color: "bg-cyan-100 dark:bg-cyan-900/30",
        },
        {
          title: "Exams",
          description: "Create and manage mock exams.",
          href: "/admin/exams",
          icon: <GraduationCap className="size-8 text-amber-500" />,
          color: "bg-amber-100 dark:bg-amber-900/30",
        },
        {
          title: "Past Exam Answers",
          description: "Manage past exam answer keys by year and semester.",
          href: "/admin/past-exams",
          icon: <FileText className="size-8 text-rose-500" />,
          color: "bg-rose-100 dark:bg-rose-900/30",
        },
        {
          title: "Homework",
          description: "Assign homework to premium students.",
          href: "/admin/homework",
          icon: <ClipboardCheck className="size-8 text-emerald-500" />,
          color: "bg-emerald-100 dark:bg-emerald-900/30",
        },
        {
          title: "Weekly Practice",
          description: "Publish short weekly practice sets.",
          href: "/admin/weekly-practice",
          icon: <CalendarCheck className="size-8 text-indigo-500" />,
          color: "bg-indigo-100 dark:bg-indigo-900/30",
        },
      ],
    },
    {
      title: "Operations",
      description: "Review feedback and control growth features.",
      links: [
        {
          title: "Feedback",
          description: "Review and track submitted user feedback.",
          href: "/admin/feedback",
          icon: <MessageSquareWarning className="size-8 text-orange-500" />,
          color: "bg-orange-100 dark:bg-orange-900/30",
        },
        {
          title: "Unlock Manager",
          description: "Manually unlock user access and entitlement.",
          href: "/admin/unlocks",
          icon: <KeyRound className="size-8 text-lime-600" />,
          color: "bg-lime-100 dark:bg-lime-900/30",
        },
        {
          title: "Referral Admin",
          description: "Monitor and support referral activities.",
          href: "/admin/referrals",
          icon: <Gift className="size-8 text-fuchsia-500" />,
          color: "bg-fuchsia-100 dark:bg-fuchsia-900/30",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-[#4c669a]">
          Manage questions, assessments, and operations.
        </p>
      </div>

      <div className="space-y-10">
        {adminSections.map((section) => (
          <section key={section.title} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#0d121b] dark:text-white">
                {section.title}
              </h2>
              <p className="text-sm text-[#4c669a] dark:text-gray-400 mt-1">
                {section.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.links.map((link) => (
                <Link key={link.href + link.title} href={link.href} className="block group">
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
          </section>
        ))}
      </div>
    </div>
  );
}
