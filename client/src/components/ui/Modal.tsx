import { motion, AnimatePresence, type Variants } from "framer-motion";
import React, { useEffect } from "react";

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }, // Cinematic exponential deceleration curve
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  // ✅ Esc key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/20 dark:bg-black/40 backdrop-blur-sm p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* --- HIGH-END EDITORIAL MODAL SHEET CANVAS --- */}
          <motion.div
            key="modal"
            className="relative w-full max-w-lg rounded-2xl p-6 overflow-hidden bg-white dark:bg-[#131316] border border-neutral-200/60 dark:border-white/[0.04] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] select-none min-w-0 flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle light leak glare running at the top boundary for raw industrial depth */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-950/[0.03] dark:via-white/[0.04] to-transparent pointer-events-none" />

            <div className="relative z-10 w-full min-w-0 h-full">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
