import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, type Variants } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  useAddGroupMembersMutation,
  useAvailableFriendsQuery,
} from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { setIsAddMember } from "@/redux/reducers/misc";
import UserItem from "@/components/shared/UserItem";
import { UserPlus, Loader2, X } from "lucide-react";

// --- RIGID TYPESCRIPT TYPES AND CONTRACTS ---
interface FriendNode {
  _id: string;
  name: string;
  avatar?: string;
  username?: string;
}

interface RootState {
  misc: {
    isAddMember: boolean;
  };
}

interface RTKQueryResult<T> {
  data?: {
    success: boolean;
    data: T;
  };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const dialogueVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }, // Cinematic deceleration curve
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    filter: "blur(3px)",
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const AddMemberDialog = ({ chatId }: { chatId: string }) => {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  const { isAddMember } = useSelector((state: RootState) => state.misc);

  // Strictly typed data fetching configuration vectors
  const { isLoading, data, isError, error } = useAvailableFriendsQuery(
    chatId,
  ) as RTKQueryResult<FriendNode[]>;

  const [addMembers, isLoadingAddMembers] = useAsyncMutation(
    useAddGroupMembersMutation,
  );

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Secure escape keystroke capture loops
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAddMember) closeHandler();
    };
    if (isAddMember) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isAddMember]);

  const selectMemberHandler = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((curr) => curr !== id) : [...prev, id],
    );
  };

  const closeHandler = () => {
    dispatch(setIsAddMember(false));
  };

  const addMemberSubmitHandler = () => {
    if (selectedMembers.length === 0) return;
    addMembers("Synchronizing membership additions...", {
      members: selectedMembers,
      chatId,
    });
    closeHandler();
  };

  useErrors([{ isError, error }] as any);

  if (!mounted || !isAddMember) return null;

  // --- ESCAPE HATCH VIA REACT PORTAL BODY DECK ---
  return createPortal(
    <motion.div
      key="add-member-backdrop"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={closeHandler}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-md p-4 select-none"
    >
      {/* --- INVENTORY SELECTION COMPONENT CANVAS SHEET --- */}
      <motion.div
        variants={dialogueVariants}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl p-6 bg-white dark:bg-[#131316] border border-neutral-200/60 dark:border-white/[0.04] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.5)] flex flex-col min-w-0 font-sans overflow-hidden max-h-[85vh]"
      >
        {/* Subtle light-leak glare running at the top boundary for cinematic depth */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-950/[0.04] dark:via-white/[0.06] to-transparent pointer-events-none" />

        {/* Structured Header Core */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-100 dark:border-white/[0.03] flex-shrink-0 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/40 dark:border-white/[0.02] flex items-center justify-center text-neutral-400 dark:text-neutral-500 shrink-0">
              <UserPlus className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white truncate block">
                Expand Channel Registry
              </h3>
            </div>
          </div>
          <button
            onClick={closeHandler}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-neutral-200/40 dark:hover:border-white/[0.03] transition-all cursor-pointer flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* --- SCROLLABLE DIRECTORY PIPELINE MATRIX --- */}
        <div className="flex-grow overflow-y-auto gap-2 flex flex-col pr-0.5 min-w-0 w-full scrollbar-none max-h-60">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 w-full">
              <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
              <span className="text-[11px] font-medium font-mono text-neutral-400 uppercase tracking-wider">
                Scanning peer directory...
              </span>
            </div>
          ) : data?.data && data.data.length > 0 ? (
            data.data.map((friend) => (
              <UserItem
                key={friend._id}
                user={friend}
                handler={selectMemberHandler}
                isAdded={selectedMembers.includes(friend._id)}
                handlerIsLoading={isLoadingAddMembers}
              />
            ))
          ) : (
            <div className="py-12 text-center text-[12px] font-medium text-neutral-400 dark:text-neutral-500 select-none block truncate">
              No authenticated peer structures available to clear registry link
              paths.
            </div>
          )}
        </div>

        {/* Action Triggers Footer Segment */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-white/[0.03] flex-shrink-0 font-sans">
          <span className="text-[10px] font-bold font-mono tracking-tight px-2 py-0.5 rounded-md bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/40 dark:border-white/[0.02] text-neutral-400">
            SELECTED: {selectedMembers.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={closeHandler}
              className="h-8 px-3.5 rounded-xl text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-50 hover:bg-neutral-100 dark:bg-white/[0.02] border border-neutral-200/50 dark:border-white/[0.04] dark:hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={addMemberSubmitHandler}
              disabled={isLoadingAddMembers || selectedMembers.length === 0}
              className="h-8 px-3.5 rounded-xl text-[11px] font-bold bg-neutral-950 hover:bg-neutral-800 dark:bg-[#f3f3f3] dark:hover:bg-white text-white dark:text-neutral-950 transition-all cursor-pointer shadow-xs disabled:opacity-20 disabled:pointer-events-none"
            >
              Commit Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
};

export default AddMemberDialog;
