import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { events } from "../../constants/events";
import { useErrors, useSocketEvents } from "@/hooks/hook";
import { getOrSaveFromStorage } from "@/utils/features";
import { useMyChatsQuery } from "../../redux/api/api";
import {
  incrementNotification,
  setNewMessagesAlert,
} from "../../redux/reducers/chat";
import {
  setIsDeleteMenu,
  setIsMobile,
  setSelectedDeleteChat,
} from "../../redux/reducers/misc";
import { getSocket } from "@/lib/Socket";
import DeleteChatMenu from "@/components/dialogs/DeleteChatMenu";
import Title from "@/components/shared/Title";
import ChatList from "@/components/specific/ChatList";
import Profile from "@/components/specific/Profile";
import Header from "../shared/Header";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const { NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } = events;

interface ChatLayoutProps {
  [key: string]: any;
}

const AppLayout =
  () => (WrappedComponent?: React.FC<any>) => (props: ChatLayoutProps) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation(); // Tracks URL changes dynamically
    const socket = getSocket();

    const chatId = params.chatId;
    const deleteMenuAnchor = useRef<HTMLDivElement | null>(null);

    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    const { isMobile } = useSelector((state: any) => state.misc);
    const { user } = useSelector((state: any) => state.auth);
    const { newMessagesAlert } = useSelector((state: any) => state.chat);

    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");

    useErrors([{ isError, error }] as any);

    // --- CRUCIAL INTERACTION FIX: AUTO-CLOSE DRAWER ON CHAT SELECTION ---
    useEffect(() => {
      dispatch(setIsMobile(false));
    }, [location.pathname, dispatch]); // Instantly un-mounts the blocking layer when switching chats

    useEffect(() => {
      getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
    }, [newMessagesAlert]);

    const handleDeleteChat = (e: any, chatId: string, groupChat: boolean) => {
      dispatch(setIsDeleteMenu(true));
      dispatch(setSelectedDeleteChat({ chatId, groupChat }));
      deleteMenuAnchor.current = e.currentTarget;
    };

    const handleMobileClose = () => dispatch(setIsMobile(false));

    const newMessageAlertListener = useCallback(
      (data: any) => {
        if (data.chatId === chatId) return;
        dispatch(setNewMessagesAlert(data));
      },
      [chatId, dispatch],
    );

    const newRequestListener = useCallback(() => {
      dispatch(incrementNotification());
    }, [dispatch]);

    const refetchListener = useCallback(() => {
      refetch();
      navigate("/");
    }, [refetch, navigate]);

    const onlineUsersListener = useCallback((data: string[]) => {
      setOnlineUsers(data);
    }, []);

    const eventHandlers = {
      [NEW_MESSAGE_ALERT]: newMessageAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
    };

    useSocketEvents(socket, eventHandlers);

    return (
      <div className="h-screen w-full overflow-hidden bg-[#fafafc] dark:bg-[#050508] text-neutral-900 dark:text-[#f5f5f7] font-sans antialiased flex flex-col transition-colors duration-500 relative">
        {/* 1. LIQUID GLASS BACKGROUND ENVIRONMENT */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] bg-[#bfa17a]/[0.05] dark:bg-[#bfa17a]/[0.012] rounded-full blur-[140px]"
            animate={{ scale: [1, 1.04, 1], y: [0, 12, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-10%] left-[-5%] w-[60vw] h-[60vw] max-w-[700px] bg-neutral-400/[0.03] dark:bg-[#f5f5f7]/[0.006] rounded-full blur-[160px]"
            animate={{ scale: [1, 1.06, 1], x: [0, -15, 0] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <Title />

        {/* Premium Frameless Top Header Bar */}
        <div className="relative z-40 bg-white/60 dark:bg-[#050508]/40 backdrop-blur-xl border-b border-neutral-200/50 dark:border-white/[0.04] flex-shrink-0">
          <Header />
        </div>

        <DeleteChatMenu
          dispatch={dispatch}
          deleteMenuAnchor={deleteMenuAnchor}
        />

        {/* Modern High-End Mobile Panel Overlay Drawer Layer */}
        <AnimatePresence>
          {isMobile && (
            <motion.div
              className="fixed inset-0 z-50 bg-neutral-950/20 dark:bg-black/50 backdrop-blur-md flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleMobileClose}
            >
              <motion.div
                className="w-[290px] max-w-[80vw] bg-white dark:bg-[#111114] border-r border-neutral-200/60 dark:border-white/[0.05] h-full shadow-2xl flex flex-col p-4 pt-16 relative min-w-0"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleMobileClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg border border-neutral-200/60 dark:border-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.015] text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-all cursor-pointer flex-shrink-0"
                  aria-label="Close user directory context panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="flex-grow overflow-y-auto rounded-xl min-w-0 scrollbar-none">
                  <ChatList
                    chats={data?.data}
                    chatId={chatId}
                    handleDeleteChat={handleDeleteChat}
                    newMessagesAlert={newMessagesAlert}
                    onlineUsers={onlineUsers}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CENTRAL SEAMLESS GRID WORKSPACE CANVAS --- */}
        <div className="flex-grow min-h-0 relative z-10 grid grid-cols-12 w-full min-w-0 p-0 sm:p-3 gap-0 sm:gap-3">
          {/* Left Control Panel Container Column Slot */}
          <aside className="hidden sm:block sm:col-span-4 md:col-span-3 h-full bg-white/40 dark:bg-[#0e0e12]/30 backdrop-blur-xl border border-neutral-200/50 dark:border-white/[0.03] rounded-2xl overflow-y-auto transition-all duration-300 shadow-xs min-w-0 scrollbar-none">
            {isLoading ? (
              <div className="w-full h-full p-5 space-y-4 min-w-0">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 w-full animate-pulse opacity-70 flex-shrink-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
                    <div className="flex-grow space-y-2.5 min-w-0">
                      <div className="h-3.5 w-2/3 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                      <div className="h-2.5 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ChatList
                chats={data?.data}
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
                onlineUsers={onlineUsers}
              />
            )}
          </aside>

          {/* Central Active Dialogue Viewport */}
          <main className="col-span-12 sm:col-span-8 md:col-span-5 lg:col-span-6 h-full overflow-hidden bg-white/80 dark:bg-[#0e0e12]/60 sm:backdrop-blur-xl border-0 sm:border border-neutral-200/60 dark:border-white/[0.04] rounded-none sm:rounded-2xl transition-all duration-300 shadow-none sm:shadow-xs relative min-w-0 w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none z-20 rounded-none sm:rounded-2xl" />

            <AnimatePresence mode="wait">
              {WrappedComponent ? (
                <motion.div
                  key={chatId || "empty-chat"}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="w-full h-full min-w-0 overflow-hidden"
                >
                  <WrappedComponent
                    {...props}
                    chatId={chatId}
                    user={user}
                    chat={data?.data?.find((chat: any) => chat._id === chatId)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col items-center justify-center text-center p-6 select-none min-w-0"
                >
                  <p className="text-[12px] tracking-wide font-medium text-neutral-400 dark:text-neutral-500 max-w-[240px] leading-relaxed">
                    Select a conversation block or channel matrix to launch
                    interactive communications.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Right Feature Panel Inspector Container Column Slot */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 h-full bg-white/40 dark:bg-[#0e0e12]/30 backdrop-blur-xl border border-neutral-200/50 dark:border-white/[0.03] rounded-2xl p-6 overflow-y-auto transition-all duration-300 shadow-xs min-w-0 scrollbar-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="h-full min-w-0"
            >
              <Profile user={user} />
            </motion.div>
          </aside>
        </div>
      </div>
    );
  };

export default AppLayout;
