import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search as SearchIcon, Users, X } from "lucide-react";
import { useInputValidation } from "6pp";
import { useAsyncMutation } from "@/hooks/hook";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "@/redux/api/api";
import { setIsSearch } from "@/redux/reducers/misc";
import UserItem from "@/components/shared/UserItem";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  _id: string;
  name: string;
  avatar?: string;
  [key: string]: any;
}

interface RootState {
  misc: {
    isSearch: boolean;
  };
}

const Search: React.FC = () => {
  const { isSearch } = useSelector((state: RootState) => state.misc);
  const [searchUser] = useLazySearchUserQuery();
  const [mounted, setMounted] = useState(false);

  const [sendFriendRequest, isLoadingSendFriendRequest]: any = useAsyncMutation(
    useSendFriendRequestMutation,
  );

  const dispatch = useDispatch();
  const search = useInputValidation("");
  const [users, setUsers] = useState<User[]>([]);

  const addFriendHandler = async (id: string) => {
    await sendFriendRequest?.("Sending friend request...", { userId: id });
  };

  const searchCloseHandler = () => dispatch(setIsSearch(false));

  // Sync component mount to guarantee safe hydration across multi-page entries
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Protected Debounce Loop Core
  useEffect(() => {
    const trimmedValue = search.value.trim();

    if (!trimmedValue) {
      setUsers([]);
      return;
    }

    const timeOutId = setTimeout(() => {
      searchUser(trimmedValue)
        .then(({ data }: any) => {
          setUsers(data?.data || []);
        })
        .catch((e: unknown) => {
          console.error("Directory pipeline execution error:", e);
          setUsers([]);
        });
    }, 400);

    return () => clearTimeout(timeOutId);
  }, [search.value]);

  // Bind key capture events to terminate search operations instantly on Escape keystrokes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearch) searchCloseHandler();
    };
    if (isSearch) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearch]);

  if (!mounted) return null;

  // --- ESCAPE HATCH VIA REACT PORTAL ---
  return createPortal(
    <AnimatePresence mode="wait">
      {isSearch && (
        <motion.div
          key="search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950/20 dark:bg-black/50 backdrop-blur-md p-4"
          onClick={searchCloseHandler}
        >
          {/* --- HIGH-END DIRECTORY FLOATING CANVAS SHEET --- */}
          <motion.div
            key="search-modal"
            initial={{ opacity: 0, scale: 0.97, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, y: 8, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl p-6 bg-white dark:bg-[#131316] border border-neutral-200/60 dark:border-white/[0.04] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.4)] flex flex-col min-w-0 select-none font-sans overflow-hidden"
          >
            {/* Subtle light-leak glare running at the top boundary for raw industrial depth */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-950/[0.03] dark:via-white/[0.05] to-transparent pointer-events-none" />

            {/* Header Structural Alignment Frame */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-white/[0.03] flex-shrink-0 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/40 dark:border-white/[0.02] flex items-center justify-center text-neutral-400 dark:text-neutral-500 shrink-0">
                  <Users className="w-4 h-4 stroke-[1.8]" />
                </div>
                <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-[#ececec] block truncate">
                  Global Directory Explorer
                </h2>
              </div>
              <button
                onClick={searchCloseHandler}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/[0.02] border border-transparent hover:border-neutral-200/40 dark:hover:border-white/[0.03] transition-all cursor-pointer flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Re-Engineered Muted Control Input Rail */}
            <div className="flex items-center w-full rounded-xl border border-neutral-200/80 dark:border-[#222226] focus-within:border-neutral-900 dark:focus-within:border-neutral-400 px-3.5 py-2.5 bg-neutral-50/50 dark:bg-[#121215]/50 transition-all duration-300 shadow-xs relative min-w-0 mb-4 flex-shrink-0">
              <SearchIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-2.5 shrink-0 stroke-[1.8]" />
              <input
                type="text"
                value={search.value}
                onChange={search.changeHandler}
                autoFocus
                placeholder="Search accounts by name or profile signatures..."
                className="flex-1 bg-transparent border-none outline-none focus:outline-none text-[13px] leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 min-w-0 w-full"
              />
            </div>

            {/* Open Active Card Scroll Tracks */}
            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto scrollbar-none pr-0.5 min-w-0 w-full flex-grow">
              {users.length > 0 ? (
                users.map((item) => (
                  <UserItem
                    user={item}
                    key={item._id}
                    handler={addFriendHandler}
                    handlerIsLoading={isLoadingSendFriendRequest}
                  />
                ))
              ) : search.value.trim() !== "" ? (
                <div className="py-12 text-center text-[12px] font-medium text-neutral-400 dark:text-neutral-500 select-none block truncate">
                  No matching profiles authenticated on the active pipeline
                  matrix.
                </div>
              ) : (
                <div className="py-12 text-center text-[12px] font-medium text-neutral-400/80 dark:text-neutral-500/80 select-none block truncate">
                  Initialize keystrokes above to scan the directory tree
                  infrastructure.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body, // Teleports right out of parent grid frames directly to body root index
  );
};

export default Search;
