"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { X, QrCode } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface WeChatPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeChatPaymentModal({ isOpen, onClose }: WeChatPaymentModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-auto"
          style={{ minHeight: "100vh", minWidth: "100vw" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            >
              <X className="size-5" />
            </button>

            <GlassPanel className="p-0 overflow-hidden relative">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center text-white">
                <div className="mx-auto bg-white/20 backdrop-blur-md rounded-2xl p-4 w-16 h-16 flex items-center justify-center mb-4">
                  <QrCode className="size-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">WeChat Payment</h2>
                <p className="text-green-50 text-sm">
                  Internal Beta Purchase
                </p>
              </div>

              <div className="p-8 flex flex-col items-center bg-white dark:bg-slate-900">
                 <div className="relative size-48 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <Image
                      src="/qrcode.png"
                      alt="WeChat QR Code"
                      fill
                      className="object-contain p-2"
                    />
                 </div>
                 
                 <p className="text-center text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                   Scan the QR code to add our support account.<br/>
                   <span className="font-semibold text-emerald-600 dark:text-emerald-400">Mention "StudyPilot Beta"</span> to get payment instructions and activation code.
                 </p>

                 <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
              </div>
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
