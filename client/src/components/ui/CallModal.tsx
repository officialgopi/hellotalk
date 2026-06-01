import { motion, AnimatePresence, type Variants } from "framer-motion";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, PhoneOff } from "lucide-react";

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 16, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    y: 12,
    filter: "blur(4px)",
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

// Micro-tweaked deceleration parameters for the confirmation alert tray
const confirmDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: 0.15, ease: "easeInOut" },
  },
};

interface CallModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

const CallModal = ({ isOpen, onClose, children }: CallModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Escape from blindly cutting off the connection layout
      if (e.key === "Escape" && onClose) {
        setShowConfirm(true);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleInitiateClose = () => {
    if (onClose) {
      setShowConfirm(true);
    }
  };

  const handleFinalTermination = () => {
    setShowConfirm(false);
    if (onClose) onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="call-backdrop"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-md p-0 select-none"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          // Crucial adjustment: Click-away triggers no exit sequence handlers
        >
          {/* --- CINEMATIC FULL WINDOW VIEWPORT OVERLAY --- */}
          <motion.div
            key="call-modal"
            className="relative w-screen h-screen flex flex-col bg-[#0a0a0c] shadow-[0_0_100px_rgba(0,0,0,0.8)] min-w-0"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle top boundary glare element */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none z-50" />

            {/* Inner Content Arena Track */}
            <div className="flex flex-col sm:flex-row w-full h-full min-w-0 min-h-0 relative z-10 overflow-hidden">
              {children}
            </div>

            {/* Re-Engineered Close Trigger Key */}
            {onClose && (
              <button
                className="absolute top-4 right-4 z-[10000] p-2.5 rounded-xl bg-black/40 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border border-white/[0.02] hover:border-rose-500/20 transition-all duration-200 cursor-pointer shadow-md group"
                onClick={handleInitiateClose}
                aria-label="Prompt streaming session termination menu"
              >
                <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              </button>
            )}

            {/* --- INTEGRATED ESCAPE SEGMENT CONFIRMATION DRAWER --- */}
            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  className="absolute inset-0 z-[20000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowConfirm(false)} // Clicking outside confirmation card aborts exit flow safely
                >
                  <motion.div
                    variants={confirmDialogVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm rounded-2xl p-5 bg-[#131316] border border-white/[0.04] shadow-2xl flex flex-col relative"
                  >
                    {/* Header Decorative Elements */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h4 className="text-[14px] font-semibold tracking-tight text-white">
                        Disconnect Active Pipeline?
                      </h4>
                    </div>

                    <p className="text-[12px] leading-relaxed text-neutral-400 font-medium">
                      You are about to terminate the current media layout
                      synchronization channel. This operation cannot be un-done.
                    </p>

                    {/* Highly Structured Executive Control Actions */}
                    <div className="flex items-center justify-end gap-2.5 mt-5 font-sans">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="h-8 px-3.5 rounded-xl text-[11px] font-semibold text-neutral-400 hover:text-white bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all cursor-pointer"
                      >
                        Keep Session
                      </button>

                      <button
                        onClick={handleFinalTermination}
                        className="h-8 px-3.5 rounded-xl text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-sm hover:shadow-rose-600/10 transition-all cursor-pointer"
                      >
                        <PhoneOff className="w-3 h-3" /> Terminate Call
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CallModal;
