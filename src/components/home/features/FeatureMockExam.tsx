import React from "react";
import { Timer, Maximize2, FileText } from "lucide-react";

export function FeatureMockExam() {
  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans border border-gray-200 dark:border-gray-800 relative">
      {/* Mock Exam UI Layer */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top Bar with Timer */}
        <div className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-10">
          <div className="flex items-center gap-2 text-slate-300">
            <FileText className="w-4 h-4" />
            <span className="font-medium text-sm">Final Exam Simulation</span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <Timer className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="font-mono text-lg font-bold text-white">01:59:45</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
             <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* Paper Content */}
        <div className="flex-1 bg-gray-100 dark:bg-slate-950 p-6 overflow-hidden flex justify-center">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 shadow-2xl h-full rounded-sm p-8 md:p-12 relative flex flex-col gap-8">
            {/* Paper Header */}
            <div className="border-b-2 border-black dark:border-white pb-4 mb-4 flex justify-between items-end">
              <h3 className="font-serif text-xl font-bold text-black dark:text-white">SECTION A</h3>
              <span className="font-serif text-sm text-gray-500">Page 1 of 12</span>
            </div>

            {/* Questions Mockup */}
            <div className="space-y-8 opacity-90">
               <div className="flex gap-4">
                 <span className="font-serif font-bold text-black dark:text-white">1.</span>
                 <div className="space-y-3 flex-1">
                   <p className="font-serif text-black dark:text-gray-100 text-lg">Explain the concept of 'deadlock' in operating systems.</p>
                   <div className="w-full h-24 bg-[repeating-linear-gradient(transparent,transparent_31px,#e5e7eb_32px)] border-b border-gray-200 dark:border-gray-700" style={{ backgroundSize: "100% 32px" }}>
                     <p className="font-handwriting text-blue-600 text-xl leading-[32px] pt-[2px] font-cursive">
                       Deadlock is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.
                     </p>
                   </div>
                 </div>
               </div>
            </div>
            
            {/* Floating Timer Notification */}
            <div className="absolute bottom-8 right-8 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-bounce">
              <Timer className="w-4 h-4 text-yellow-400" />
              <span>5 minutes remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
