import React from "react";
import { BookOpen, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export function FeatureAnalysis() {
  return (
    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans border border-gray-200 dark:border-gray-800 p-6 lg:p-8">
       {/* Header */}
       <div className="flex items-center justify-between mb-8">
         <div>
           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis</h3>
           <p className="text-sm text-gray-500">Weekly Progress Report</p>
         </div>
         <div className="flex gap-2">
           <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold flex items-center gap-1">
             <TrendingUp className="w-3 h-3" /> +12%
           </div>
         </div>
       </div>

       {/* Subject Progress */}
       <div className="space-y-6">
         
         {/* Subject 1 */}
         <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
               <span className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-blue-500" /> Computer Science
               </span>
               <span className="font-bold text-blue-600">85%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full w-[85%] animate-[progress_1s_ease-out_forwards]" />
            </div>
         </div>

         {/* Subject 2 */}
         <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
               <span className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-purple-500" /> Mathematics
               </span>
               <span className="font-bold text-purple-600">62%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
               <div className="h-full bg-purple-500 rounded-full w-[62%] animate-[progress_1.2s_ease-out_forwards]" />
            </div>
         </div>

         <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
               <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase mb-2">
                  <CheckCircle2 className="w-3 h-3" /> Strongest
               </div>
               <p className="font-bold text-gray-900 dark:text-white">Binary Trees</p>
               <p className="text-xs text-green-600 mt-1">98% Accuracy</p>
            </div>

            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
               <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase mb-2">
                  <AlertCircle className="w-3 h-3" /> Weakest
               </div>
               <p className="font-bold text-gray-900 dark:text-white">Graph Theory</p>
               <p className="text-xs text-red-600 mt-1">45% Accuracy</p>
            </div>
         </div>

       </div>
    </div>
  );
}
