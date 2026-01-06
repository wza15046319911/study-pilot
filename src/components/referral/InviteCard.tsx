"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface InviteCardProps {
  code: string;
}

export function InviteCard({ code }: InviteCardProps) {
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState(
    `https://studypilot.io/invite/${code}`
  );

  useEffect(() => {
    setInviteLink(`${window.location.origin}/invite/${code}`);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on StudyPilot",
          text: "I'm using StudyPilot to master my exams. Join via my link and we both get free premium access!",
          url: inviteLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 flex items-center gap-2 shadow-sm">
      <div className="flex-1 bg-gray-50 dark:bg-slate-950 rounded-lg px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-300 truncate border border-gray-100 dark:border-gray-800">
        {inviteLink}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-10 px-4 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
      <Button
        onClick={handleShare}
        className="h-10 px-4 bg-[#135bec] hover:bg-blue-600 text-white rounded-lg"
      >
        <Share2 className="size-4" />
        <span className="hidden sm:inline ml-2">Share</span>
      </Button>
    </div>
  );
}
