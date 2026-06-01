import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Paperclip,
  PhoneCall,
  Send,
  Video,
  Lock,
  ShieldCheck,
} from "lucide-react";
import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import { getSocket } from "@/lib/Socket";
import { events } from "../constants/events";

import { useChatDetailsQuery, useGetMessagesQuery } from "@/redux/api/api";
import { useErrors, useSocketEvents } from "@/hooks/hook";
import { useInfiniteScrollTop } from "6pp";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "@/components/loaders/Loaders";
import { useNavigate } from "react-router-dom";
import AutoResizeTextarea from "@/components/ui/AutoResizeTextArea";
import AvatarCard from "@/components/shared/AvatarCard";
import Modal from "@/components/ui/CallModal";
import Call from "@/components/specific/Call";
import { motion } from "framer-motion";

const {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} = events;

const Chat = ({
  chatId,
  user,
  chat,
}: {
  chatId: string;
  user: any;
  chat: any;
}) => {
  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callMode, setCallMode] = useState<"audio" | "video">("audio");
  const [incomingOffer, setIncomingOffer] =
    useState<RTCSessionDescriptionInit | null>(null);
  const [incomingCallerId, setIncomingCallerId] = useState<string | null>(null);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef<any>(null);
  const { isFileMenu } = useSelector((state: any) => state.misc);

  const chatDetails = useChatDetailsQuery({
    chatId,
    populate: true,
    skip: !chatId,
  });
  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.data.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.data.messages,
  );

  const isMessageLoading = oldMessagesChunk.isLoading;

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.data?.members;
  const otherMemberEntry = Array.isArray(members)
    ? members.find((m: any) =>
        typeof m === "string" ? m !== user._id : m?._id !== user._id,
      )
    : null;
  const resolvedCalleeId =
    typeof otherMemberEntry === "string"
      ? otherMemberEntry
      : otherMemberEntry?._id || null;

  const messageOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket?.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket?.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, 2000);
  };

  const handleToggleFileOpen = () => {
    dispatch(setIsFileMenu(!isFileMenu));
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket?.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  useEffect(() => {
    socket?.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket?.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatDetails.isError) navigate("/");
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);
    },
    [chatId],
  );

  const startTypingListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId],
  );

  const stopTypingListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId],
  );

  const alertListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "system-alert",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId],
  );

  const alertEventHandler: Record<string, (...args: any) => any> = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  useSocketEvents(socket, alertEventHandler);
  useErrors(errors as any);

  useEffect(() => {
    const offerListener = ({
      offer,
      from,
      mode,
    }: {
      offer: RTCSessionDescriptionInit;
      from: string;
      mode?: "audio" | "video";
    }) => {
      setIncomingOffer(offer);
      setIncomingCallerId(from);
      setCallMode(mode || "audio");
      setIsCallOpen(true);
    };
    socket?.off("receive:offer");
    socket?.on("receive:offer", offerListener);
    return () => {
      socket?.off("receive:offer", offerListener);
    };
  }, [socket]);

  const allMessages = [...oldMessages, ...messages];
  const attachmentBtnRef = useRef<HTMLButtonElement>(null);
  return chatDetails.isLoading ? (
    <div className="h-full w-full flex items-center justify-center bg-[#fdfdfd] dark:bg-[#0a0a0c]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-neutral-200 dark:border-neutral-800 border-t-neutral-800 dark:border-t-neutral-200 rounded-full animate-spin" />
        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 tracking-wide">
          Syncing secure pipeline...
        </p>
      </div>
    </div>
  ) : (
    <div className="flex w-full flex-col h-full min-w-0 bg-[#fdfdfd] dark:bg-[#0a0a0c] transition-colors duration-500 overflow-hidden font-sans">
      {/* --- PREVENT BREAKING HEADER PANE --- */}
      <header className="h-[72px] min-h-[72px] border-b border-neutral-200/50 dark:border-white/[0.03] bg-white/80 dark:bg-[#0a0a0c]/60 backdrop-blur-xl flex items-center justify-between px-6 z-20 shadow-xs min-w-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative flex-shrink-0">
            <AvatarCard avatar={chat?.avatar} />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a0a0c]" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-[#ececec] truncate block">
              {chat?.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 truncate">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>Secure Connection</span>
            </div>
          </div>
        </div>

        {!chat?.groupChat && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <motion.button
              whileHover={{ scale: 1.04, y: -0.5 }}
              whileTap={{ scale: 0.96 }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/50 dark:border-white/[0.03] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
              onClick={() => {
                setCallMode("audio");
                setIncomingOffer(null);
                setIncomingCallerId(null);
                setIsCallOpen(true);
              }}
              disabled={!resolvedCalleeId}
            >
              <PhoneCall className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -0.5 }}
              whileTap={{ scale: 0.96 }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/50 dark:border-white/[0.03] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
              onClick={() => {
                setCallMode("video");
                setIncomingOffer(null);
                setIncomingCallerId(null);
                setIsCallOpen(true);
              }}
              disabled={!resolvedCalleeId}
            >
              <Video className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </header>

      {/* --- REFINED DIALOGUE CANVAS --- */}
      <div
        ref={containerRef}
        className="flex-grow overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-4 bg-[#fafafc] dark:bg-[#08080a] relative z-10 flex flex-col scrollbar-none min-w-0"
      >
        <div className="w-full flex justify-center py-1 flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-medium px-4 py-1.5 rounded-full bg-white dark:bg-[#121215] border border-neutral-200/40 dark:border-white/[0.02] text-neutral-400 dark:text-neutral-500 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <span>Encrypted chat canvas</span>
          </div>
        </div>

        {allMessages.map((msg) => {
          const isSenderMe = msg.sender?._id === user?._id;
          const isSystemAlert = msg.sender?._id === "system-alert";

          if (isSystemAlert) {
            return (
              <div
                key={msg._id}
                className="w-full flex justify-center py-1 flex-shrink-0"
              >
                <span className="text-[11px] font-medium tracking-wide text-neutral-400/80 dark:text-neutral-500/80 px-3 py-1 rounded-lg bg-neutral-200/40 dark:bg-white/[0.01] max-w-full break-words text-center">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 12, x: isSenderMe ? 8 : -8 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 35,
                mass: 0.8,
              }}
              className={`w-full flex flex-shrink-0 ${isSenderMe ? "justify-end pl-12 md:pl-20" : "justify-start pr-12 md:pr-20"}`}
            >
              <div
                className={`flex flex-col max-w-[85%] sm:max-w-[72%] ${isSenderMe ? "items-end" : "items-start"} group min-w-0`}
              >
                {/* --- SOOTHING EDITORIAL MOOD COLOR CHANNELS --- */}
                <div
                  className={`px-4 py-2.5 text-[13px] leading-relaxed transition-all duration-300 break-words overflow-wrap-anywhere word-break-word whitespace-pre-wrap border ${
                    isSenderMe
                      ? "bg-[#3b4252] dark:bg-[#e4e4e7] text-[#f5f5f7] dark:text-[#18181b] border-[#3b4252] dark:border-[#e4e4e7] rounded-2xl rounded-tr-xs shadow-xs"
                      : "bg-[#f0f2f5] dark:bg-[#18181c] text-[#2e3440] dark:text-[#e1e1e6] border-[#f0f2f5] dark:border-white/[0.02] rounded-2xl rounded-tl-xs shadow-xs"
                  }`}
                >
                  {msg.content ? (
                    msg.content
                  ) : (
                    <MessageComponent data={msg} user={user} />
                  )}
                </div>

                {msg.createdAt && (
                  <span className="text-[10px] font-medium text-neutral-400/70 dark:text-neutral-500/70 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 tracking-wider flex-shrink-0">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {userTyping && (
          <div className="w-full flex justify-start items-center gap-3 pl-2 pt-1 flex-shrink-0">
            <div className="bg-[#f0f2f5] dark:bg-[#18181c] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center justify-center">
              <TypingLoader />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-2 w-full flex-shrink-0" />
      </div>

      {/* --- FOOTER CONTAINER INPUT --- */}
      <footer className="p-4 bg-[#fafafc] dark:bg-[#08080a] border-t border-neutral-200/40 dark:border-white/[0.02] relative z-20 pb-6 flex-shrink-0 min-w-0">
        <form
          onSubmit={submitHandler}
          className="w-full max-w-4xl mx-auto flex items-end gap-3 min-w-0"
        >
          <div className="flex-grow flex items-end gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121215] border border-neutral-200/80 dark:border-[#222226] focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-all duration-300 shadow-xs relative min-w-0">
            <div className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer pb-1 self-center flex-shrink-0">
              <div
                className="relative flex items-center justify-center"
                onClick={handleToggleFileOpen}
              >
                <FileMenu triggerRef={attachmentBtnRef} chatId={chatId} />
                <button
                  ref={attachmentBtnRef}
                  className="w-4 h-4 transition-transform hover:rotate-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFileOpen();
                  }}
                >
                  <Paperclip className="w-full h-full" />
                </button>
              </div>
            </div>

            <div className="flex-grow text-sm text-neutral-800 dark:text-neutral-200 max-h-24 sm:max-h-32 overflow-y-auto min-w-0 w-full py-0.5">
              <AutoResizeTextarea
                onChange={messageOnChange}
                value={message}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none placeholder-neutral-400 dark:placeholder-neutral-500 text-[13px] leading-relaxed block overflow-x-hidden"
                onKeyDown={(e: any) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitHandler(e);
                  }
                }}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!message.trim() || isMessageLoading}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-xl bg-[#3b4252] dark:bg-[#e4e4e7] text-white dark:text-[#18181b] hover:bg-[#2e3440] dark:hover:bg-white transition-all duration-200 disabled:opacity-20 disabled:pointer-events-none shadow-sm flex-shrink-0 self-end"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </footer>

      <Modal
        isOpen={isCallOpen}
        onClose={() => {
          setIsCallOpen(false);
          setIncomingOffer(null);
          setIncomingCallerId(null);
        }}
      >
        <Call
          calleeId={resolvedCalleeId}
          callerId={incomingCallerId}
          mode={callMode}
          isOutgoing={!incomingOffer}
          initialOffer={incomingOffer}
          onClose={() => {
            setIsCallOpen(false);
            setIncomingOffer(null);
            setIncomingCallerId(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default AppLayout()(Chat);
