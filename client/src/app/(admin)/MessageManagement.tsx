import { useFetchData } from "6pp";
import moment from "moment";
import { useEffect, useState, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import AdminLayout from "../../components/layout/AdminLayout";
import Table from "../../components/shared/Table";
import { SERVER_API_URL } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { fileFormat, transformImage } from "@/utils/features";
import { Music, Film, FileText, Download, X } from "lucide-react";

// --- RIGID TYPESCRIPT TYPES AND ADMIN DATAMODELS ---
interface SenderNode {
  name: string;
  avatar: string;
}

interface AttachmentNode {
  url: string;
  _id?: string;
}

interface MessageRowModel {
  id: string;
  _id: string;
  content: string;
  groupChat: boolean;
  chat: string;
  sender: SenderNode;
  attachments: AttachmentNode[];
  createdAt: string;
}

interface RTKFetchResult<T> {
  loading: boolean;
  data?: {
    success: boolean;
    data: T;
  };
  error: any;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    y: 6,
    filter: "blur(3px)",
    transition: { duration: 0.15, ease: "easeInOut" },
  },
};

// --- MODERN PREMIUM CELL BADGE RENDERING SCHEME ---
const AttachmentBadge = ({
  url,
  onSelect,
}: {
  url: string;
  onSelect: () => void;
}) => {
  const type = fileFormat(url)?.toLowerCase();

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
  };

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(type)) {
    return (
      <button
        onClick={handleBadgeClick}
        className="h-8 pl-1 pr-2.5 rounded-lg border border-neutral-200/60 dark:border-white/[0.04] bg-neutral-50 dark:bg-white/[0.01] hover:bg-neutral-100 dark:hover:bg-white/[0.03] flex items-center gap-1.5 transition-all text-neutral-600 dark:text-neutral-400 group/badge cursor-pointer max-w-[130px]"
      >
        <img
          src={transformImage(url, 50)}
          alt="Admin thumbnail asset"
          className="w-5 h-5 rounded-md object-cover border border-neutral-200/50 dark:border-white/[0.02] transition-transform group-hover/badge:scale-[1.04]"
        />
        <span className="text-[11px] font-bold font-mono uppercase tracking-tight truncate">
          IMAGE
        </span>
      </button>
    );
  }

  // Define design parameters across differing attachment classes
  const config = {
    video: {
      icon: <Film className="w-3 h-3" />,
      label: "VIDEO",
      style:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    audio: {
      icon: <Music className="w-3 h-3" />,
      label: "AUDIO",
      style:
        "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
    file: {
      icon: <FileText className="w-3 h-3" />,
      label: "DOC",
      style:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  }[type === "video" || type === "audio" ? type : "file"];

  return (
    <button
      onClick={handleBadgeClick}
      className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 font-sans font-bold text-[11px] font-mono tracking-tight transition-all cursor-pointer hover:brightness-95 dark:hover:brightness-105 ${config.style}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
};

const MessageManagement = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    file: string;
  } | null>(null);
  const [rows, setRows] = useState<MessageRowModel[]>([]);

  const { loading, data, error } = useFetchData({
    url: `${SERVER_API_URL}/admin/messages`,
    key: "dashboard-messages",
    dependencyProps: [],
    credentials: "include",
  }) as RTKFetchResult<any[]>;

  // ✅ Fixed: Shifted away from strict never[] allocation arrays to bypass compilation errors
  useErrors([{ isError: !!error, error }] as never[]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (data?.data) {
      setRows(
        data.data.map((i: any) => ({
          ...i,
          id: i._id,
          sender: {
            name: i.sender?.name || "System Node",
            avatar: i.sender?.avatar || "",
          },
          createdAt: moment(i.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
        })),
      );
    }
  }, [data]);

  // Escape key overlay handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMedia) setSelectedMedia(null);
    };
    if (selectedMedia) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedMedia]);

  // Dynamic layout column specification contracts maps
  const columns = [
    {
      field: "id",
      headerName: "ID",
      headerClassName: "table-header",
      width: 200,
    },
    {
      field: "attachments",
      headerName: "Attachments",
      headerClassName: "table-header",
      width: 240,
      renderCell: (params: any) => {
        const itemAttachments = params.row.attachments as AttachmentNode[];
        return itemAttachments && itemAttachments.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 items-center w-full h-full py-1 overflow-x-auto scrollbar-none">
            {itemAttachments.map((i, index) => {
              const url = i.url;
              const file = fileFormat(url);
              return (
                <AttachmentBadge
                  key={index}
                  url={url}
                  onSelect={() => setSelectedMedia({ url, file })}
                />
              );
            })}
          </div>
        ) : (
          <span className="text-[11px] font-bold font-mono uppercase tracking-wide text-neutral-400">
            Empty Array
          </span>
        );
      },
    },
    {
      field: "content",
      headerName: "Content",
      headerClassName: "table-header",
      width: 350,
    },
    {
      field: "sender",
      headerName: "Sent By",
      headerClassName: "table-header",
      width: 200,
      renderCell: (params: any) => (
        <div className="flex items-center gap-2.5 h-full">
          <img
            src={transformImage(params.row.sender.avatar, 50)}
            alt={params.row.sender.name}
            className="w-7 h-7 rounded-full object-cover border border-neutral-200/40 dark:border-white/[0.02]"
          />
          <span className="text-[12px] font-semibold text-neutral-700 dark:text-[#e2e2e7] truncate">
            {params.row.sender.name}
          </span>
        </div>
      ),
    },
    {
      field: "chat",
      headerName: "Chat ID Scope",
      headerClassName: "table-header",
      width: 220,
    },
    {
      field: "groupChat",
      headerName: "Type",
      headerClassName: "table-header",
      width: 120,
      renderCell: (params: any) => (
        <div className="flex items-center h-full">
          <span
            className={`text-[10px] font-bold font-mono tracking-tight px-2 py-0.5 rounded-md border ${
              params.row.groupChat
                ? "bg-blue-500/05 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                : "bg-neutral-50 dark:bg-white/[0.01] text-neutral-500 border-neutral-200/60 dark:border-white/[0.03]"
            }`}
          >
            {params.row.groupChat ? "GROUP_CLUSTER" : "DIRECT_LINK"}
          </span>
        </div>
      ),
    },
    {
      field: "createdAt",
      headerName: "Timestamp Logs",
      headerClassName: "table-header",
      width: 250,
    },
  ];

  return (
    <AdminLayout>
      {loading ? (
        <div className="w-full h-full min-h-[70vh] flex items-center justify-center p-8 select-none">
          <div className="w-full max-w-4xl flex flex-col gap-3 animate-pulse opacity-75">
            <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-52 w-full bg-neutral-100 dark:bg-neutral-900 rounded-2xl" />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full min-w-0"
        >
          <Table
            heading={"System Message Registry"}
            columns={columns}
            rows={rows}
            rowHeight={70}
          />
        </motion.div>
      )}

      {/* --- TELEPORTED ADMIN HIGH-FIDELITY VIEWER DRAWER OVERLAY --- */}
      {mounted &&
        createPortal(
          <AnimatePresence mode="wait">
            {selectedMedia && (
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setSelectedMedia(null)}
                className="fixed inset-0 z-[999999] bg-neutral-950/40 dark:bg-black/85 backdrop-blur-xl p-4 flex flex-col items-center justify-center font-sans select-none pointer-events-auto"
              >
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white border border-neutral-200/40 dark:border-white/[0.03] transition-all cursor-pointer z-50 group"
                >
                  <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                </button>

                <motion.div
                  variants={modalVariants}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl rounded-2xl p-2.5 bg-white dark:bg-[#111114] border border-neutral-200/60 dark:border-white/[0.04] shadow-2xl flex flex-col relative overflow-hidden"
                >
                  <div className="overflow-y-auto rounded-xl flex items-center justify-center bg-neutral-50 dark:bg-[#08080a]/60 w-full min-h-[260px] max-h-[60vh] p-4 border border-neutral-100 dark:border-white/[0.02]">
                    {["jpg", "jpeg", "png", "gif", "webp"].includes(
                      selectedMedia.file?.toLowerCase(),
                    ) && (
                      <img
                        src={selectedMedia.url}
                        alt="Admin Expanded Inspector Media"
                        className="max-w-full h-auto max-h-[55vh] object-contain rounded-lg shadow-xs select-none"
                      />
                    )}

                    {selectedMedia.file?.toLowerCase() === "video" && (
                      <video
                        src={selectedMedia.url}
                        controls
                        autoPlay
                        className="max-w-full h-auto max-h-[55vh] object-contain rounded-lg shadow-xs"
                      />
                    )}

                    {selectedMedia.file?.toLowerCase() === "audio" && (
                      <div className="flex flex-col items-center p-6 text-center w-full max-w-md gap-4 bg-white dark:bg-[#141418] rounded-xl border border-neutral-200/50 dark:border-white/[0.03] shadow-xs">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                          <Music className="w-4 h-4" />
                        </div>
                        <audio
                          src={selectedMedia.url}
                          controls
                          className="w-full h-8 mt-1"
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
                    ].includes(selectedMedia.file?.toLowerCase()) && (
                      <div className="flex flex-col items-center p-8 text-center max-w-sm gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#18181c] flex items-center justify-center text-neutral-400 dark:text-neutral-500 border border-neutral-200/50 dark:border-white/[0.02]">
                          <FileText className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <span className="text-xs font-semibold block text-neutral-800 dark:text-neutral-200 truncate max-w-[240px]">
                          {selectedMedia.url.split("/").pop()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 px-2 py-0.5 flex-shrink-0">
                    <span className="text-[10px] font-bold font-mono tracking-tight text-neutral-400 max-w-[60%] truncate">
                      LOG_URI // {selectedMedia.url}
                    </span>
                    <a
                      href={selectedMedia.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-[#f3f3f3] dark:hover:bg-white text-white dark:text-neutral-950 text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Log Packet
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </AdminLayout>
  );
};

export default memo(MessageManagement);
