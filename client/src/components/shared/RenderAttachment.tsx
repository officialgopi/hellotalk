import React from "react";
import { transformImage } from "@/utils/features";
import { FileIcon, Volume2, Maximize2, FileText } from "lucide-react";

interface RenderAttachmentProps {
  file: string;
  url: string;
  onSelect: () => void; // Parent callback hook anchor
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf")
    return <FileText className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
  if (["doc", "docx", "txt", "md"].includes(ext || ""))
    return <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  if (["zip", "rar", "tar", "gz"].includes(ext || ""))
    return <FileIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  return (
    <FileIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
  );
};

export const RenderAttachment: React.FC<RenderAttachmentProps> = ({
  file,
  url,
  onSelect,
}) => {
  const parsedFileName = url
    ? url.split("/").pop() || "Document asset"
    : "Document file";

  // Prevent parent chat link bubbles from firing when clicking inner structural media sliders
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  switch (file?.toLowerCase()) {
    case "video":
      return (
        <div
          onClick={handleContainerClick}
          className="relative max-w-[280px] sm:max-w-xs rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-200/50 dark:border-white/[0.04] group/video shadow-md flex-shrink-0 min-w-0 cursor-pointer"
        >
          {/* We strip native controls here because clicking the placeholder launches full-theater modal preview mode */}
          <video
            src={url}
            preload="metadata"
            className="w-full h-auto block max-h-44 object-cover pointer-events-none rounded-2xl brightness-90 group-hover/video:brightness-100 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/0 transition-colors flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/[0.1] flex items-center justify-center text-white scale-95 group-hover/video:scale-100 transition-all opacity-80 group-hover/video:opacity-100">
              <Maximize2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>
      );

    case "image":
      return (
        <div
          onClick={handleContainerClick}
          className="relative max-w-[280px] sm:max-w-xs rounded-2xl overflow-hidden bg-white dark:bg-[#121215]/60 border border-neutral-200/60 dark:border-white/[0.04] shadow-xs flex-shrink-0 group/img block cursor-pointer min-w-0"
        >
          <img
            src={transformImage(url, 400)}
            alt="Uploaded media viewport node"
            className="w-full h-auto max-h-56 object-cover rounded-2xl transition-all duration-500 ease-[0.16,1,0.3,1] group-hover/img:scale-[1.02] group-hover/img:brightness-[0.93] dark:group-hover/img:brightness-[1.04] block select-none"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-black/40 backdrop-blur-md border border-white/[0.06] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-200 text-white transform scale-95 group-hover/img:scale-100 pointer-events-none">
            <Maximize2 className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>
      );

    case "audio":
      return (
        <div
          onClick={handleContainerClick}
          className="w-full max-w-[260px] p-3 rounded-2xl bg-white dark:bg-[#111114]/80 border border-neutral-200/60 dark:border-white/[0.04] flex flex-col gap-2 shadow-xs flex-shrink-0 min-w-0 cursor-pointer hover:border-neutral-400 dark:hover:border-white/[0.08] transition-all group/audio"
        >
          <div className="flex items-center justify-between min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-bold tracking-tight font-mono uppercase text-neutral-400 dark:text-neutral-500 truncate">
                Playback_Track.mp3
              </span>
            </div>
            <Maximize2 className="w-3 h-3 text-neutral-400 opacity-0 group-hover/audio:opacity-100 transition-opacity" />
          </div>
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden relative">
            <div className="absolute left-0 inset-y-0 w-1/3 bg-violet-500 dark:bg-violet-400 rounded-full" />
          </div>
        </div>
      );

    default:
      return (
        <div
          onClick={handleContainerClick}
          className="flex items-center justify-between gap-4 pl-3.5 pr-4 py-3 rounded-2xl bg-white dark:bg-[#111114]/80 backdrop-blur-md border border-neutral-200/60 dark:border-white/[0.04] shadow-sm max-w-xs w-full min-w-0 transition-all duration-300 hover:border-neutral-400/50 dark:hover:border-white/[0.1] hover:bg-neutral-50 dark:hover:bg-[#151519]/90 group/file flex-shrink-0 cursor-pointer relative"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-neutral-50 dark:bg-[#1a1a1e] flex items-center justify-center text-neutral-500 flex-shrink-0 border border-neutral-200/50 dark:border-white/[0.03] shadow-inner transition-transform duration-300 group-hover/file:scale-[1.03]">
              {getFileIcon(parsedFileName)}
            </div>
            <div className="flex flex-col min-w-0 space-y-0.5">
              <span className="text-[12px] font-semibold tracking-tight text-neutral-800 dark:text-[#ececec] truncate block">
                {parsedFileName}
              </span>
              <span className="text-[9px] font-bold text-neutral-400 font-mono uppercase tracking-wide">
                {(file || "DAT").toUpperCase()} DOCUMENT
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg border border-neutral-200/60 dark:border-white/[0.02] bg-neutral-50/50 dark:bg-white/[0.01] flex items-center justify-center text-neutral-400 group-hover/file:bg-white dark:group-hover/file:bg-white/[0.03] transition-all shrink-0">
            <Maximize2 className="w-3 h-3 stroke-[2.2]" />
          </div>
        </div>
      );
  }
};

export default RenderAttachment;
