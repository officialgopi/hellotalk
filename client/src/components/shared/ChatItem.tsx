import React, { memo } from "react";
import AvatarCard from "./AvatarCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ChatItemProps {
  avatar?: string[];
  name: string;
  _id: string;
  groupChat?: boolean;
  sameSender?: boolean;
  isOnline?: boolean;
  newMessageAlert?: { count: number };
  index?: number;
  handleDeleteChat?: (
    e: React.MouseEvent,
    id: string,
    groupChat: boolean,
  ) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  avatar = [],
  name,
  _id,
  groupChat = false,
  sameSender,
  isOnline,
  newMessageAlert,
  index = 0,
  handleDeleteChat,
}) => {
  return (
    <Link
      to={`/chat/${_id}`}
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault(); // Defensive intercept stops native browser context panel collisions
        handleDeleteChat?.(e, _id, groupChat);
      }}
      className="block w-full min-w-0"
    >
      <motion.div
        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{
          delay: Math.min(0.03 * index, 0.2),
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`relative flex items-center gap-3.5 mx-2 my-1 px-4 h-[64px] rounded-xl transition-all duration-200 select-none min-w-0 group cursor-pointer border ${
          sameSender
            ? "bg-white dark:bg-white/[0.03] border-neutral-200/80 dark:border-white/[0.04] text-neutral-900 dark:text-[#f3f3f3] shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
            : "bg-transparent border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-white/[0.015]"
        }`}
      >
        {/* --- PREMIUM BRAND SIDE ACCENT INDICATOR --- */}
        {sameSender && (
          <motion.div
            layoutId="activeChatIndicator"
            className="absolute left-0 top-1/4 w-[3px] h-1/2 bg-neutral-900 dark:bg-white rounded-r-md shadow-sm"
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
          />
        )}

        {/* Avatar Node Wrapper with Defensive Core Sizing */}
        <div className="relative flex-shrink-0">
          <AvatarCard avatar={avatar as any} />
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0e0e12] z-10 shadow-sm" />
          )}
        </div>

        {/* Informational Text Hierarchy */}
        <div className="flex-grow min-w-0 flex flex-col justify-center space-y-0.5">
          <span
            className={`text-[13px] tracking-tight truncate block transition-colors ${
              sameSender ? "font-semibold" : "font-medium"
            }`}
          >
            {name}
          </span>

          {/* Muted Premium Message Indicator String */}
          {newMessageAlert && newMessageAlert.count > 0 && (
            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 truncate block">
              Active discussion streams
            </span>
          )}
        </div>

        {/* --- LUXURY MINIMAL ALERTS COUNT FLAG --- */}
        {newMessageAlert && newMessageAlert.count > 0 && (
          <div className="flex-shrink-0 ml-2">
            <span className="h-4 min-w-4 flex items-center justify-center px-1 text-[9px] font-bold font-mono tracking-tighter text-white bg-neutral-950 dark:bg-white dark:text-neutral-950 rounded-full shadow-sm">
              {newMessageAlert.count}
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default memo(ChatItem);
