"use client";

import * as React from "react";
import { useAppStore } from "@/store";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: any; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [onClose, toast.duration]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-teal-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  return (
    <div className="group relative flex w-full gap-3 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80 p-4 shadow-2xl backdrop-blur-md">
      <div className="shrink-0">{icons[toast.type as keyof typeof icons]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate">{toast.title}</h4>
        <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-white/10"
      />
    </div>
  );
}
