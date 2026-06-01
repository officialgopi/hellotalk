import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const dialogueVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }, // Executive deceleration curve
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
    filter: "blur(2px)",
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

interface ConfirmDeleteDialogProps {
  open: boolean;
  handleClose: () => void;
  deleteHandler: () => void;
}

const ConfirmDeleteDialog = ({
  open,
  handleClose,
  deleteHandler,
}: ConfirmDeleteDialogProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Secure keystroke tracking parameters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleClose();
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  if (!mounted || !open) return null;

  // --- ESCAPE HATCH VIA REACT PORTAL BODY ATTACHMENT ---
  return createPortal(
    <motion.div
      key="confirm-backdrop"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={handleClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-md p-4 select-none"
    >
      {/* --- ELITE VERIFICATION ALERT CARD SHUTTER --- */}
      <motion.div
        variants={dialogueVariants}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl p-5 bg-white dark:bg-[#131316] border border-neutral-200/60 dark:border-white/[0.04] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.5)] flex flex-col min-w-0 font-sans"
      >
        {/* Subtle light-leak glare running at the top boundary for cinematic depth */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-950/[0.04] dark:via-white/[0.06] to-transparent pointer-events-none" />

        {/* Header Block Alignment */}
        <div className="flex items-center gap-3 mb-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white truncate block">
            Terminate Group Directory?
          </h3>
        </div>

        {/* Content Paragraph Block */}
        <p className="text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400 font-medium">
          Are you completely certain you want to destroy this group channel
          asset matrix? All archive data structures and historic connection
          records will be purged.
        </p>

        {/* Refined Executive Control Trigger Tracks */}
        <div className="flex items-center justify-end gap-2 mt-5 flex-shrink-0">
          <button
            onClick={handleClose}
            className="h-8 px-3.5 rounded-xl text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-50 hover:bg-neutral-100 dark:bg-white/[0.02] border border-neutral-200/50 dark:border-white/[0.04] dark:hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            Abort
          </button>

          <button
            onClick={deleteHandler}
            className="h-8 px-3.5 rounded-xl text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-xs hover:shadow-rose-600/10 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Purge Directory
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body, // Teleports outside parent layout nodes completely
  );
};

export default ConfirmDeleteDialog;
