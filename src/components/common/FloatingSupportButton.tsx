"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Mail, QrCode } from "lucide-react";

export function FloatingSupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const constraintsRef = useRef(null);

  return (
    <>
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-[100]"
      />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        className="fixed bottom-6 right-6 z-[101]"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center pointer-events-auto"
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <HelpCircle className="size-6" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: -8, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10, x: 0 }}
              className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden pointer-events-auto"
            >
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <HelpCircle className="size-5 text-blue-500" />
                  Need Help?
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 flex flex-col items-center text-center">
                    <div className="relative size-32 mb-2">
                      <img
                        src="/qrcode.png"
                        alt="WeChat QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Scan WeChat QR Code
                    </p>
                  </div>

                  <a
                    href="mailto:zianwang9911@gmail.com"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        Email Support
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        zianwang9911@gmail.com
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
