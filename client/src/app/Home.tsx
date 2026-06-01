import AppLayout from "@/components/layout/AppLayout";
import { MessageSquarePlus } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="h-full w-full bg-transparent flex flex-col items-center justify-center p-6 md:p-8 select-none font-sans min-w-0">
      {/* --- PRE_COMPUTED BRAND GRAPHIC ENTERING HUB --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-sm min-w-0"
      >
        {/* Soft Ambient Icon Container Deck */}
        <div className="w-12 h-12 rounded-2xl bg-neutral-100/80 dark:bg-white/[0.02] border border-neutral-200/50 dark:border-white/[0.03] flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-5 shadow-xs shrink-0">
          <MessageSquarePlus className="w-5 h-5 stroke-[1.5]" />
        </div>

        {/* Brand Callout Typography Stack */}
        <h2 className="text-[14px] font-semibold tracking-tight text-neutral-800 dark:text-[#ececec] block">
          No channel stream initialized
        </h2>

        <p className="mt-1.5 text-[12px] leading-relaxed font-medium text-neutral-400/90 dark:text-neutral-500/90">
          Select an active profile card or group cluster matrix from the sidebar
          panel directory to deploy your encrypted messaging canvas.
        </p>
      </motion.div>
    </div>
  );
};

export default AppLayout()(Home);
