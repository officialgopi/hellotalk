import { motion } from "framer-motion";

// Clean, ultra-subtle, theme-aware shimmer effect properties
const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: { backgroundPosition: "200% 0" },
  transition: { repeat: Infinity, duration: 1.6, ease: "linear" as const },
};

const LayoutLoader = () => {
  // Balanced skeleton tokens that match the layout gap configuration of AppLayout perfectly
  const skeletonCardClass = `
    w-full h-full rounded-2xl border transition-all duration-300
    bg-gradient-to-r from-neutral-100 via-neutral-200/60 to-neutral-100 
    dark:from-[#111114] dark:via-[#1c1c22] dark:to-[#111114] 
    border-neutral-200/40 dark:border-white/[0.02]
    bg-[length:200%_100%]
  `;

  const skeletonBubbleClass = `
    w-full h-[72px] rounded-xl border transition-all duration-300
    bg-gradient-to-r from-neutral-100 via-neutral-200/50 to-neutral-100 
    dark:from-[#111114] dark:via-[#16161b] dark:to-[#111114] 
    border-neutral-200/30 dark:border-white/[0.015]
    bg-[length:200%_100%]
  `;

  return (
    <div className="grid grid-cols-12 h-[calc(100vh-4rem)] p-3 gap-3 relative z-10 select-none pointer-events-none w-full min-w-0">
      {/* Left Sidebar Skeleton Column */}
      <div className="hidden sm:block sm:col-span-4 md:col-span-3 h-full min-w-0">
        <motion.div
          className={skeletonCardClass}
          initial={shimmer.initial}
          animate={shimmer.animate}
          transition={shimmer.transition}
        />
      </div>

      {/* Central Conversation Screen Skeleton List */}
      <div className="col-span-12 sm:col-span-8 md:col-span-5 lg:col-span-6 h-full flex flex-col gap-3 min-w-0 overflow-hidden p-4 rounded-2xl bg-white/20 dark:bg-[#0e0e12]/10 border border-neutral-200/40 dark:border-white/[0.02]">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            className={skeletonBubbleClass}
            style={{ opacity: 1 - index * 0.15 }} // Sophisticated fade-out illusion toward lower bounds
            initial={shimmer.initial}
            animate={shimmer.animate}
            transition={shimmer.transition}
          />
        ))}
      </div>

      {/* Right Feature Panel Inspector Skeleton Column */}
      <div className="hidden md:block md:col-span-4 lg:col-span-3 h-full min-w-0">
        <motion.div
          className={skeletonCardClass}
          initial={shimmer.initial}
          animate={shimmer.animate}
          transition={shimmer.transition}
        />
      </div>
    </div>
  );
};

const TypingLoader = () => {
  return (
    <div className="flex items-center justify-center gap-1 py-1 px-1.5 select-none">
      {[0, 0.12, 0.24].map((delay, i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-neutral-400/80 dark:bg-neutral-500/80 flex-shrink-0"
          animate={{ y: ["0px", "-4px", "0px"] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay, // Safely handled inside Framer context
          }}
        />
      ))}
    </div>
  );
};

export { TypingLoader, LayoutLoader };
