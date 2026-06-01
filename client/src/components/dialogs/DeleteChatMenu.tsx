import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useSelector } from "react-redux";
import { setIsDeleteMenu } from "../../redux/reducers/misc";
import { useNavigate } from "react-router-dom";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useDeleteChatMutation,
  useLeaveGroupMutation,
} from "../../redux/api/api";
import { Trash2, LogOut } from "lucide-react";

// --- RIGID TYPESCRIPT TYPES AND CONTRACTS ---
interface SelectedDeleteChatModel {
  chatId: string;
  groupChat: boolean;
}

interface RootState {
  misc: {
    isDeleteMenu: boolean;
    selectedDeleteChat: SelectedDeleteChatModel | null;
  };
}

interface DeleteChatMenuProps {
  dispatch: any;
  deleteMenuAnchor: React.MutableRefObject<HTMLDivElement | null>;
}

const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -4, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }, // Premium deceleration curve
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -2,
    filter: "blur(1px)",
    transition: { duration: 0.12, ease: "easeInOut" },
  },
};

const DeleteChatMenu: React.FC<DeleteChatMenuProps> = ({
  dispatch,
  deleteMenuAnchor,
}) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  const { isDeleteMenu, selectedDeleteChat } = useSelector(
    (state: RootState) => state.misc,
  );

  const [deleteChat, , deleteChatData] = useAsyncMutation(
    useDeleteChatMutation,
  ) as [any, boolean, any];
  const [leaveGroup, , leaveGroupData] = useAsyncMutation(
    useLeaveGroupMutation,
  ) as [any, boolean, any];

  const isGroup = selectedDeleteChat?.groupChat;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const closeHandler = () => {
    dispatch(setIsDeleteMenu(false));
    deleteMenuAnchor.current = null;
  };

  const leaveGroupHandler = () => {
    if (!selectedDeleteChat?.chatId) return;
    closeHandler();
    leaveGroup("Leaving Group...", selectedDeleteChat.chatId);
  };

  const deleteChatHandler = () => {
    if (!selectedDeleteChat?.chatId) return;
    closeHandler();
    deleteChat("Deleting Chat...", selectedDeleteChat.chatId);
  };

  useEffect(() => {
    if (deleteChatData || leaveGroupData) navigate("/");
  }, [deleteChatData, leaveGroupData, navigate]);

  // Bind universal escape key to close floating operational trays instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDeleteMenu) closeHandler();
    };
    if (isDeleteMenu) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleteMenu]);

  if (!mounted || !isDeleteMenu || !deleteMenuAnchor.current) return null;

  // Real-time anchor tracking computations
  const anchorRect = deleteMenuAnchor.current.getBoundingClientRect();

  // --- REACT PORTAL DOM ATTACHMENT EXPORT ---
  return createPortal(
    <AnimatePresence mode="wait">
      <div
        key="portal-menu-wrapper"
        className="fixed inset-0 z-[999999] pointer-events-none font-sans select-none"
      >
        {/* Transparent backdrop tracking layer to capture outside clicks safely */}
        <div
          className="absolute inset-0 pointer-events-auto bg-transparent cursor-default"
          onClick={closeHandler}
        />

        {/* --- PREMIUM TRANSLUCENT CONTEXT BOX TRAY --- */}
        <motion.div
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute pointer-events-auto min-w-[150px] w-40 rounded-xl bg-white dark:bg-[#131316] border border-neutral-200/80 dark:border-white/[0.04] shadow-[0_12px_32px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden"
          style={{
            top: anchorRect.bottom + window.scrollY + 6,
            left: Math.max(12, anchorRect.right + window.scrollX - 160), // Safeguard against edge-overflow bounds
          }}
          onClick={isGroup ? leaveGroupHandler : deleteChatHandler}
        >
          <div className="w-full p-1 flex flex-col gap-0.5">
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold rounded-lg transition-all duration-150 cursor-pointer text-left
                ${
                  isGroup
                    ? "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/[0.02]"
                    : "text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50/20 dark:bg-rose-500/05 hover:bg-rose-50/60 dark:hover:bg-rose-500/10"
                }`}
            >
              {isGroup ? (
                <>
                  <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Leave Group</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Delete Chat</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

export default DeleteChatMenu;
