import { transformImage } from "@/utils/features";
import { FileIcon, Film, Play, Volume2 } from "lucide-react";

const RenderAttachment = (file: string, url: string) => {
  switch (file) {
    case "video":
      return (
        <div className="relative max-w-[260px] sm:max-w-xs rounded-xl overflow-hidden bg-neutral-900/50 dark:bg-black/20 border border-neutral-200/50 dark:border-white/[0.03] group/video shadow-xs flex-shrink-0">
          <video
            src={url}
            preload="metadata"
            controls
            className="w-full h-auto block max-h-48 object-cover rounded-xl"
          />
        </div>
      );

    case "image":
      return (
        <div className="relative max-w-[260px] sm:max-w-xs rounded-xl overflow-hidden bg-neutral-100/50 dark:bg-neutral-900/30 border border-neutral-200/40 dark:border-white/[0.02] shadow-xs flex-shrink-0 group/img">
          <img
            src={transformImage(url, 400)}
            alt="Uploaded media stream container"
            className="w-full h-auto max-h-56 object-cover rounded-xl transition-transform duration-500 group-hover/img:scale-[1.02] block select-none"
            loading="lazy"
          />
        </div>
      );

    case "audio":
      return (
        <div className="w-full max-w-[240px] px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#1c1c21] border border-neutral-200/60 dark:border-white/[0.04] flex flex-col gap-1.5 shadow-xs flex-shrink-0">
          <div className="flex items-center gap-2 opacity-60">
            <Volume2 className="w-3.5 h-3.5 text-current flex-shrink-0" />
            <span className="text-[10px] font-semibold tracking-wide font-sans uppercase">
              Audio Broadcast
            </span>
          </div>
          <audio
            src={url}
            preload="none"
            controls
            className="w-full h-7 text-xs mt-0.5"
          />
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-between gap-4 pl-3 pr-4 py-2.5 rounded-xl bg-neutral-50/80 dark:bg-[#18181b]/90 border border-neutral-200/60 dark:border-white/[0.03] shadow-xs max-w-xs w-full min-w-0 transition-all hover:bg-neutral-100 dark:hover:bg-[#1f1f24] group/file flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-200/60 dark:bg-white/[0.03] flex items-center justify-center text-neutral-500 dark:text-neutral-400 flex-shrink-0 border border-neutral-300/20 dark:border-white/[0.02]">
              <FileIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 space-y-0.5">
              <span className="text-[12px] font-medium text-neutral-800 dark:text-[#e1e1e6] truncate block">
                {url ? url.split("/").pop() : "Document file"}
              </span>
              <span className="text-[10px] font-medium text-neutral-400 font-mono uppercase tracking-tight">
                {file || "Unknown"} File
              </span>
            </div>
          </div>
        </div>
      );
  }
};

export default RenderAttachment;
