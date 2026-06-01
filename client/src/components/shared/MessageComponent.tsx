import { memo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import moment from "moment";
import { fileFormat } from "@/utils/features";
import RenderAttachment from "./RenderAttachment";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Download, X, FileText, Volume2 } from "lucide-react";

interface MessageData {
  sender: {
    _id: string;
    name: string;
  };
  content?: string;
  attachments?: Array<{ url: string }>;
  createdAt: string;
}

interface MessageComponentProps {
  data: MessageData;
  user: {
    _id: string;
  };
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    filter: "blur(3px)",
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

const MessageComponent = ({ data, user }: MessageComponentProps) => {
  const { sender, content, attachments = [], createdAt } = data;
  const sameSender = sender?._id === user?._id;
  const [mounted, setMounted] = useState(false);

  const formattedTime = moment(createdAt).format("h:mm A");

  // Dynamic universal lightbox configuration state tracking vectors
  const [selectedAttachment, setSelectedAttachment] = useState<{
    url: string;
    file: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAttachment) setSelectedAttachment(null);
    };
    if (selectedAttachment) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedAttachment]);

  return (
    <>
      <div
        className={`flex flex-col w-full max-w-[85%] sm:max-w-[72%] group min-w-0 mb-2 select-none ${
          sameSender ? "items-end ml-auto" : "items-start mr-auto"
        }`}
      >
        {!sameSender && sender?.name && (
          <span className="text-[10px] font-bold text-neutral-400/80 dark:text-neutral-500/80 mb-1 pl-1 tracking-wider uppercase font-mono">
            {sender.name}
          </span>
        )}

        <div
          className={`relative px-4 py-2.5 text-[13px] leading-relaxed transition-all duration-300 min-w-0 max-w-full flex flex-col gap-2 ${
            sameSender
              ? "bg-[#242427] dark:bg-[#e4e4e7] text-[#f5f5f7] dark:text-[#1c1c1e] rounded-2xl rounded-tr-xs shadow-xs"
              : "bg-[#f4f4f6] dark:bg-[#111114] text-[#2c2c2e] dark:text-[#e3e3e8] border border-neutral-200/40 dark:border-white/[0.03] rounded-2xl rounded-tl-xs"
          }`}
        >
          {content && (
            <p className="break-words overflow-wrap-anywhere word-break-word whitespace-pre-wrap font-sans selection:bg-amber-500/20">
              {content}
            </p>
          )}

          {attachments.length > 0 && (
            <div
              className={`flex flex-col gap-2 min-w-0 w-full ${content ? "mt-1" : ""}`}
            >
              {attachments.map((attachment, index) => {
                const url = attachment.url;
                const file = fileFormat(url);

                return (
                  <div key={index} className="w-full min-w-0 block">
                    <RenderAttachment
                      file={file}
                      url={url}
                      onSelect={() => setSelectedAttachment({ url, file })}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <span className="text-[9px] font-bold font-mono tracking-wider text-neutral-400/60 dark:text-neutral-500/60 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
          {formattedTime}
        </span>
      </div>

      {/* --- UNIVERSAL THEATER MODAL INTERFACE LIGHTBOX OVERLAY --- */}
      {mounted &&
        createPortal(
          <AnimatePresence mode="wait">
            {selectedAttachment && (
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setSelectedAttachment(null)}
                className="fixed inset-0 z-[999999] bg-[#070709]/60 dark:bg-black/85 backdrop-blur-xl p-4 flex flex-col items-center justify-center font-sans select-none pointer-events-auto"
              >
                {/* Escape Cross Shutter */}
                <button
                  onClick={() => setSelectedAttachment(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.03] dark:bg-white/[0.01] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-neutral-200/40 dark:border-white/[0.03] transition-all cursor-pointer z-50 group"
                >
                  <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                </button>

                <motion.div
                  variants={modalVariants}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-3xl rounded-2xl p-2.5 bg-white dark:bg-[#111114] border border-neutral-200/60 dark:border-white/[0.04] shadow-2xl flex flex-col relative overflow-hidden max-h-[85vh]"
                >
                  {/* --- SEAMLESS TYPE-AWARE FULL THEATER PLAYER ARENA --- */}
                  <div className="overflow-y-auto rounded-xl flex items-center justify-center bg-neutral-50 dark:bg-[#08080a]/60 w-full min-h-[220px] max-h-[65vh] p-4 border border-neutral-100 dark:border-white/[0.02]">
                    {["jpg", "jpeg", "png", "gif", "webp"].includes(
                      selectedAttachment.file?.toLowerCase(),
                    ) && (
                      <img
                        src={selectedAttachment.url}
                        alt="Modal visualization file asset viewport"
                        className="max-w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-xs select-none"
                      />
                    )}

                    {selectedAttachment.file?.toLowerCase() === "video" && (
                      <video
                        src={selectedAttachment.url}
                        controls
                        autoPlay
                        className="max-w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-xs"
                      />
                    )}

                    {selectedAttachment.file?.toLowerCase() === "audio" && (
                      <div className="flex flex-col items-center p-6 text-center w-full max-w-md gap-4 bg-white dark:bg-[#141418] rounded-xl border border-neutral-200/50 dark:border-white/[0.03] shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-inner animate-pulse">
                          <Volume2 className="w-5 h-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0 w-full">
                          <span className="text-xs font-semibold block text-neutral-800 dark:text-neutral-200 truncate">
                            Audio Playback Stream
                          </span>
                          <span className="text-[10px] font-medium font-mono text-neutral-400 uppercase tracking-tight block mt-0.5">
                            Media Broadcast Channel
                          </span>
                        </div>
                        <audio
                          src={selectedAttachment.url}
                          controls
                          className="w-full h-8 mt-2"
                        />
                      </div>
                    )}

                    {![
                      "jpg",
                      "jpeg",
                      "png",
                      "gif",
                      "webp",
                      "video",
                      "audio",
                    ].includes(selectedAttachment.file?.toLowerCase()) && (
                      <div className="flex flex-col items-center p-8 text-center max-w-sm gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#18181c] flex items-center justify-center text-neutral-400 dark:text-neutral-500 border border-neutral-200/50 dark:border-white/[0.02]">
                          <FileText className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-800 dark:text-[#ececec] truncate max-w-[240px] block">
                            {selectedAttachment.url.split("/").pop()}
                          </h4>
                          <p className="text-[11px] font-medium text-neutral-400 mt-1 uppercase font-mono tracking-wide">
                            Binary {selectedAttachment.file || "Unknown"} Data
                            Archive Package
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lightbox Status HUD Footer Controls */}
                  <div className="flex items-center justify-between mt-3 px-2 py-0.5 flex-shrink-0">
                    <span className="text-[10px] font-bold font-mono tracking-tight text-neutral-400 max-w-[60%] truncate">
                      PACKETID //{" "}
                      {selectedAttachment.url.split("/").pop()?.slice(-16)}
                    </span>
                    <a
                      href={selectedAttachment.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-[#f3f3f3] dark:hover:bg-white text-white dark:text-neutral-950 text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Asset Packet
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};

export default memo(MessageComponent);
