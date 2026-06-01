import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, setUploadingLoader } from "../../redux/reducers/misc";
import { useSendAttachmentsMutation } from "../../redux/api/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Music as AudioIcon,
  Video as VideoIcon,
  File as FileIcon,
  X,
} from "lucide-react";

interface FileMenuProps {
  chatId: string;
}

const FileMenu: React.FC<FileMenuProps> = ({ chatId }) => {
  const { isFileMenu } = useSelector((state: any) => state.misc);
  const dispatch = useDispatch();

  const imageRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [sendAttachments] = useSendAttachmentsMutation();

  const closeFileMenu = () => dispatch(setIsFileMenu(false));

  const selectImage = () => imageRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();

  const fileChangeHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    if (files.length <= 0) return;

    if (files.length > 5)
      return toast.error(`You can only send 5 ${key} at a time`);

    dispatch(setUploadingLoader(true));
    const toastId = toast.loading(`Uploading ${key}...`);
    closeFileMenu();

    try {
      const myForm = new FormData();
      myForm.append("chatId", chatId);
      files.forEach((file) => myForm.append("files", file));

      const res = await sendAttachments(myForm);

      if (res.data) {
        toast.success(`${key} sent successfully`, { id: toastId });
      } else {
        toast.error(`Failed to send ${key}`, { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.message || "Upload failed", { id: toastId });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  const menuItems = [
    {
      label: "Image",
      icon: <ImageIcon className="w-4 h-4 stroke-[1.8]" />,
      action: selectImage,
      ref: imageRef,
      accept: "image/png, image/jpeg, image/gif, image/webp",
    },
    {
      label: "Audio",
      icon: <AudioIcon className="w-4 h-4 stroke-[1.8]" />,
      action: selectAudio,
      ref: audioRef,
      accept: "audio/mpeg, audio/wav, audio/ogg, audio/aac",
    },
    {
      label: "Video",
      icon: <VideoIcon className="w-4 h-4 stroke-[1.8]" />,
      action: selectVideo,
      ref: videoRef,
      accept: "video/mp4, video/webm, video/ogg",
    },
    {
      label: "File",
      icon: <FileIcon className="w-4 h-4 stroke-[1.8]" />,
      action: selectFile,
      ref: fileRef,
      accept: "*",
    },
  ];

  return (
    <AnimatePresence>
      {isFileMenu && (
        <>
          {/* Fully Invisible Interactive Click Barrier */}
          <motion.div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              closeFileMenu();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* --- ULTRA-PREMIUM CONTEXT DECK --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-[calc(100%+16px)] left-0 z-50 w-44 rounded-xl overflow-hidden bg-white/95 dark:bg-[#131316]/95 backdrop-blur-xl border border-neutral-200/60 dark:border-white/[0.04] shadow-[0_12px_30px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] origin-bottom-left select-none"
          >
            {/* Header Header Strip */}
            <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-neutral-100 dark:border-white/[0.03]">
              <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                Attachments
              </span>
              <button
                onClick={closeFileMenu}
                className="p-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-white/[0.03] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selection Grid Rails */}
            <ul
              className="p-1 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {menuItems.map(({ label, icon, action, ref, accept }) => (
                <li
                  key={label}
                  onClick={(e) => {
                    e.stopPropagation();
                    action();
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/[0.015] transition-all duration-150 cursor-pointer text-left group"
                >
                  <div className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors shrink-0">
                    {icon}
                  </div>
                  <span className="text-[13px] font-medium">{label}</span>
                  <input
                    type="file"
                    multiple
                    accept={accept}
                    className="hidden"
                    ref={ref}
                    onChange={(e) => fileChangeHandler(e, `${label}s`)}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileMenu;
