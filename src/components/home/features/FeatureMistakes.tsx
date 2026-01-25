import React from "react";
import { AlertTriangle, RotateCw, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export function FeatureMistakes() {
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-slate-950 rounded-xl shadow-xl overflow-hidden flex flex-col font-sans border border-gray-200 dark:border-gray-800 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
         <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Review Needed</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Mistake Book</h3>
         </div>
         <div className="bg-white dark:bg-slate-900 p-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
               <RotateCw className="w-5 h-5" />
            </div>
         </div>
      </div>

      {/* Mistake Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
         
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded uppercase">3 Attempts</span>
              <span className="text-xs text-gray-400 font-medium">Data Structures</span>
            </div>
            
            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Time complexity of QuickSort?</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 border border-red-100 dark:border-red-900/20">
                 <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase mb-1">
                    <XCircle className="w-3 h-3" /> My Answer
                 </div>
                 <p className="font-mono text-sm text-gray-800 dark:text-gray-200">O(n)</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-900/20">
                 <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase mb-1">
                    <CheckCircle2 className="w-3 h-3" /> Correct
                 </div>
                 <p className="font-mono text-sm text-gray-800 dark:text-gray-200">O(n log n)</p>
              </div>
            </div>

            <button className="mt-4 w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2">
               Practice Again <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
      
      {/* Background Stack Effect */}
      <div className="mx-4 mt-[-10px] h-4 bg-white dark:bg-slate-900 rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 opacity-60" />
      <div className="mx-8 mt-[-10px] h-4 bg-white dark:bg-slate-900 rounded-b-xl border-x border-b border-gray-200 dark:border-gray-800 opacity-30" />

    </div>
  );
}
