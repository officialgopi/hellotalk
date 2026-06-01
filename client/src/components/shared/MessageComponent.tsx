import { memo, useState } from "react";
import moment from "moment";
import { fileFormat } from "@/utils/features";
import RenderAttachment from "./RenderAttachment";
import { AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";
import { Download, ExternalLink } from "lucide-react";

const MessageComponent = ({ data, user }: { data: any; user: any }) => {
  const { sender, content, attachments = [], createdAt } = data;
  const sameSender = sender?._id === user?._id;

  // Clean, standardized short-form timestamp
  const formattedTime = moment(createdAt).format("h:mm A");

  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  return (
    <>
      <div
        className={`flex flex-col w-full max-w-[85%] sm:max-w-[72%] group min-w-0 ${
          sameSender ? "items-end" : "items-start"
        }`}
      >
        {/* Muted Sender Label — High-End Minimalist Typography */}
        {!sameSender && sender?.name && (
          <span className="text-[10px] font-semibold text-neutral-400/80 dark:text-neutral-500/80 mb-1 pl-1 tracking-wider uppercase font-sans">
            {sender.name}
          </span>
        )}

        {/* --- PREMIUM GRAPHITE & CHALK SURFACE ENGINE --- */}
        <div
          className={`relative px-4 py-2.5 text-[13px] leading-relaxed transition-all duration-300 min-w-0 max-w-full ${
            sameSender
              ? "bg-[#242427] dark:bg-[#e4e4e7] text-[#f5f5f7] dark:text-[#1c1c1e] rounded-2xl rounded-tr-xs shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              : "bg-[#f4f4f6] dark:bg-[#18181b] text-[#2c2c2e] dark:text-[#e3e3e8] border border-neutral-200/40 dark:border-white/[0.02] rounded-2xl rounded-tl-xs"
          }`}
        >
          {/* Main Message Content */}
          {content && (
            <p className="break-words overflow-wrap-anywhere word-break-word whitespace-pre-wrap font-sans selection:bg-amber-500/10">
              {content}
            </p>
          )}

          {/* Premium Integrated Attachment Blocks */}
          {attachments.length > 0 && (
            <div
              className={`space-y-1.5 min-w-0 w-full ${content ? "mt-3" : ""}`}
            >
              {attachments.map((attachment: any, index: number) => {
                const url = attachment.url;
                const file = fileFormat(url);
                const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
                  file,
                );

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedAttachment({ url, file })}
                    className={`group/media relative rounded-xl overflow-hidden cursor-pointer transition-all max-w-full block border ${
                      sameSender
                        ? "bg-white/[0.08] border-white/[0.05] hover:bg-white/[0.12]"
                        : "bg-white dark:bg-[#202024] border-neutral-200/60 dark:border-white/[0.02] hover:bg-neutral-50 dark:hover:bg-[#26262b]"
                    }`}
                  >
                    <div className="p-2 flex items-center justify-between gap-3 text-current">
                      <div className="flex items-center gap-2.5 text-xs font-medium truncate min-w-0">
                        <span className="opacity-70 shrink-0 select-none">
                          {RenderAttachment(file, url)}
                        </span>
                        {isImage ? (
                          <span className="truncate opacity-80 text-[11px] font-sans">
                            Preview Image
                          </span>
                        ) : (
                          <span className="truncate opacity-80 text-[11px] font-mono tracking-tight uppercase">
                            {file || "FILE"}
                          </span>
                        )}
                      </div>

                      <div className="opacity-0 group-hover/media:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 shrink-0 px-1">
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Micro-Metadata Timestamp (Reveals softly on hover) */}
        <span className="text-[10px] font-medium text-neutral-400/70 dark:text-neutral-500/70 mt-1.5 px-1 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none shrink-0 font-sans">
          {formattedTime}
        </span>
      </div>

      {/* --- REFINED MEDIA LIGHTBOX PREVIEW --- */}
      <AnimatePresence>
        {selectedAttachment && (
          <Modal
            key={selectedAttachment.url}
            isOpen={!!selectedAttachment}
            onClose={() => setSelectedAttachment(null)}
          >
            <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto">
              <div className="max-w-full max-h-[75vh] overflow-hidden rounded-2xl bg-white dark:bg-[#0f0f11] border border-neutral-200 dark:border-white/[0.04] p-2 flex flex-col relative group shadow-2xl">
                <div className="overflow-auto max-w-full max-h-full rounded-xl">
                  {RenderAttachment(
                    selectedAttachment.file,
                    selectedAttachment.url,
                  )}
                </div>

                {/* Floating Lightbox Actions */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                  <a
                    href={selectedAttachment.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 rounded-lg bg-neutral-900/90 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 border border-white/[0.06] hover:bg-neutral-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Media
                  </a>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(MessageComponent);
