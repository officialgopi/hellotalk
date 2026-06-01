import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, setUploadingLoader } from "../../redux/reducers/misc";
import { useSendAttachmentsMutation } from "../../redux/api/api";
import { toast } from "sonner";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Image as ImageIcon,
  Music as AudioIcon,
  Video as VideoIcon,
  File as FileIcon,
  X,
} from "lucide-react";

interface RootState {
  misc: {
    isFileMenu: boolean;
  };
}

interface FileMenuProps {
  chatId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const menuVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 12,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1], // High-end deceleration curve
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: [0.7, 0, 0.84, 0], // Snappy acceleration curve
    },
  },
};

const FileMenu: React.FC<FileMenuProps> = ({ chatId, triggerRef }) => {
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const { isFileMenu } = useSelector((state: RootState) => state.misc);

  const [coords, setCoords] = useState<{ bottom: number; left: number }>({
    bottom: 0,
    left: 0,
  });

  const imageRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [sendAttachments] = useSendAttachmentsMutation();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const closeFileMenu = () => dispatch(setIsFileMenu(false));

  useEffect(() => {
    if (isFileMenu && triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();

      setCoords({
        bottom: window.innerHeight - triggerRect.top + 14, // Extra spacing offset for elegant breathing room
        left: Math.max(16, triggerRect.left + triggerRect.width / 2 - 96), // Clean screen alignment constraints
      });
    }
  }, [isFileMenu, triggerRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFileMenu) closeFileMenu();
    };
    if (isFileMenu) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFileMenu]);

  const fileChangeHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length <= 0) return;

    if (files.length > 5) {
      return toast.error(
        `Maximum threshold bound: 5 ${key} files allowed simultaneously`,
      );
    }

    dispatch(setUploadingLoader(true));
    const toastId = toast.loading(
      `Streaming encrypted assets data packet [type: ${key}]...`,
    );
    closeFileMenu();

    try {
      const myForm = new FormData();
      myForm.append("chatId", chatId);
      files.forEach((file) => myForm.append("files", file));

      const res = await sendAttachments(myForm);

      if (res.data) {
        toast.success(`Network transfer complete. Channel updated.`, {
          id: toastId,
        });
      } else {
        toast.error(`Broadcast rejection error. Check cluster logs.`, {
          id: toastId,
        });
      }
    } catch (error: any) {
      toast.error(error?.message || "Operational attachment pipeline failure", {
        id: toastId,
      });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  if (!mounted || !isFileMenu || !triggerRef?.current) return null;

  const selectImage = () => imageRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();

  // Premium interactive items map featuring distinct glass background highlights
  const menuItems = [
    {
      label: "Images & Vectors",
      subLabel: "PNG, JPEG, GIF, WEBP",
      icon: <ImageIcon className="w-3.5 h-3.5" />,
      action: selectImage,
      ref: imageRef,
      accept: "image/png, image/jpeg, image/gif, image/webp",
      styles:
        "hover:bg-blue-500/[0.04] dark:hover:bg-blue-400/[0.05] hover:text-blue-600 dark:hover:text-blue-400 text-neutral-600 dark:text-neutral-400",
      iconStyles:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    },
    {
      label: "Audio Broadcasts",
      subLabel: "MP3, WAV, AAC, OGG",
      icon: <AudioIcon className="w-3.5 h-3.5" />,
      action: selectAudio,
      ref: audioRef,
      accept: "audio/mpeg, audio/wav, audio/ogg, audio/aac",
      styles:
        "hover:bg-violet-500/[0.04] dark:hover:bg-violet-400/[0.05] hover:text-violet-600 dark:hover:text-violet-400 text-neutral-600 dark:text-neutral-400",
      iconStyles:
        "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
    },
    {
      label: "Video Renderings",
      subLabel: "MP4, WEBM, MOV",
      icon: <VideoIcon className="w-3.5 h-3.5" />,
      action: selectVideo,
      ref: videoRef,
      accept: "video/mp4, video/webm, video/ogg",
      styles:
        "hover:bg-amber-500/[0.04] dark:hover:bg-amber-400/[0.05] hover:text-amber-600 dark:hover:text-amber-400 text-neutral-600 dark:text-neutral-400",
      iconStyles:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    },
    {
      label: "Document Archives",
      subLabel: "PDF, ZIP, JSON, TXT",
      icon: <FileIcon className="w-3.5 h-3.5" />,
      action: selectFile,
      ref: fileRef,
      accept: "*",
      styles:
        "hover:bg-emerald-500/[0.04] dark:hover:bg-emerald-400/[0.05] hover:text-emerald-600 dark:hover:text-emerald-400 text-neutral-600 dark:text-neutral-400",
      iconStyles:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    },
  ];

  return createPortal(
    <AnimatePresence mode="wait">
      <div
        key="portal-file-wrapper"
        className="fixed inset-0 z-[99999] pointer-events-none font-sans select-none antialiased"
      >
        <div
          className="absolute inset-0 pointer-events-auto bg-transparent cursor-default"
          onClick={closeFileMenu}
        />

        {/* --- DUAL LAYER HIGH-GLOSS CONTEXT CANVAS --- */}
        <motion.div
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="absolute pointer-events-auto w-52 rounded-2xl bg-white/80 dark:bg-[#0c0c0e]/70 border border-neutral-200/50 dark:border-white/[0.03] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden"
          style={{
            bottom: coords.bottom,
            left: coords.left,
          }}
        >
          {/* Subtle light-leak internal line trace */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-950/[0.03] dark:via-white/[0.05] to-transparent pointer-events-none" />

          {/* HUD Status Header Control Track */}
          <div className="flex justify-between items-center px-4 py-3 bg-neutral-50/40 dark:bg-neutral-900/[0.15] border-b border-neutral-100 dark:border-white/[0.02]">
            <span className="text-[10px] font-bold tracking-widest font-mono uppercase text-neutral-400 dark:text-neutral-500">
              Media Vault
            </span>
            <button
              onClick={closeFileMenu}
              className="p-1 rounded-lg border border-transparent hover:border-neutral-200/50 dark:hover:border-white/[0.03] bg-transparent hover:bg-white dark:hover:bg-white/[0.02] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all cursor-pointer flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Core Rail Entries */}
          <ul className="p-1.5 flex flex-col gap-0.5">
            {menuItems.map(
              (
                {
                  label,
                  subLabel,
                  icon,
                  action,
                  ref,
                  accept,
                  styles,
                  iconStyles,
                },
                index,
              ) => (
                <React.Fragment key={label}>
                  {/* Visual partition separator splitting media classifications from standard raw archives */}
                  {index === 3 && (
                    <div className="my-1 mx-2 h-px bg-neutral-100 dark:bg-white/[0.02]" />
                  )}

                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      action();
                    }}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer text-left group/item ${styles}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/item:scale-[1.04] ${iconStyles}`}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0 flex-grow flex flex-col">
                      <span className="text-[12px] font-semibold tracking-tight text-neutral-800 dark:text-[#ececec] group-hover/item:text-current transition-colors">
                        {label}
                      </span>
                      <span className="text-[9px] font-medium tracking-tight font-mono text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase">
                        {subLabel}
                      </span>
                    </div>

                    <input
                      type="file"
                      multiple
                      accept={accept}
                      className="hidden"
                      ref={ref}
                      onChange={(e) =>
                        fileChangeHandler(e, `${label.split(" ")[0]}s`)
                      }
                    />
                  </li>
                </React.Fragment>
              ),
            )}
          </ul>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

export default FileMenu;
