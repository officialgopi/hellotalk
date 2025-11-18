import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Paperclip, PhoneCall, Send, Video } from "lucide-react";
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
    oldMessagesChunk.data?.data.messages
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.data?.members;
  const otherMemberEntry = Array.isArray(members)
    ? members.find((m: any) =>
        typeof m === "string" ? m !== user._id : m?._id !== user._id
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
      console.log(data);
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data: any) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
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
    [chatId]
  );

  const eventHandler: Record<string, (...args: any) => any> = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  useSocketEvents(socket, eventHandler);
  useErrors(errors as any);

  // Open call modal on incoming offer (accept/reject popup)
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
    // Ensure we only have a single listener (avoid duplicates across modal mounts)
    socket?.off("receive:offer");
    socket?.on("receive:offer", offerListener);
    return () => {
      socket?.off("receive:offer", offerListener);
    };
  }, [socket]);

  const allMessages = [...oldMessages, ...messages];

  return chatDetails.isLoading ? (
    <div className="p-4 text-neutral-500">Loading chat...</div>
  ) : (
    <div className="flex w-full flex-col h-full relative overflow-hidden">
      <div className="relative top-0 left-0 right-0 h-[60px] bg-neutral-200 dark:bg-neutral-900 border-b border-neutral-500/50 flex items-center  p-2">
        <AvatarCard avatar={chat?.avatar} />
        <div className="flex-1 ml-4 text-neutral-900 dark:text-neutral-100 text-lg font-medium">
          {chat?.name}
        </div>
        {!chat?.groupChat && (
          <div className="flex gap-2 items-center">
            <button
              className="p-1 hover:cursor-pointer dark:text-neutral-100"
              onClick={() => {
                setCallMode("audio");
                setIncomingOffer(null);
                setIncomingCallerId(null);
                setIsCallOpen(true);
              }}
              disabled={!resolvedCalleeId}
            >
              <PhoneCall />
            </button>
            <button
              className="p-1 hover:cursor-pointer dark:text-neutral-100"
              onClick={() => {
                setCallMode("video");
                setIncomingOffer(null);
                setIncomingCallerId(null);
                setIsCallOpen(true);
              }}
              disabled={!resolvedCalleeId}
            >
              <Video />
            </button>
          </div>
        )}
      </div>
      {/* Messages container */}
      <div
        ref={containerRef}
        className="flex flex-col p-4 gap-4 bg-neutral-50 dark:bg-neutral-900 flex-1  overflow-y-auto overflow-x-hidden"
      >
        {allMessages.map((i) => (
          <MessageComponent key={i._id} data={i} user={user} />
        ))}

        {userTyping && <TypingLoader />}
        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={submitHandler}
        className="min-h-[10%] max-h-[20%] relative border-t border-neutral-500/50 bg-neutral-100 dark:bg-neutral-900   "
      >
        <div className="flex items-center h-full p-4 relative">
          <div className="text-neutral-600 w-full dark:text-neutral-300 flex items-center gap-2 border border-neutral-500/50 rounded-lg p-2 focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 ">
            <div className="  text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white">
              <div className="relative" onClick={handleToggleFileOpen}>
                <FileMenu chatId={chatId} />
                <Paperclip
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFileOpen();
                  }}
                />
              </div>
            </div>

            <AutoResizeTextarea
              onChange={messageOnChange}
              value={message}
              className="relative bottom-0"
            />
          </div>

          <button
            type="submit"
            className="ml-4 p-2 rounded-full border border-neutral-500/50 text-neutral-800 hover:bg-neutral-800 hover:text-neutral-100 transition dark:text-neutral-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
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
