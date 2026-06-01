import { memo } from "react";
import { motion } from "framer-motion";
import { UserPlus, UserMinus } from "lucide-react";
import { transformImage } from "@/utils/features";

interface UserItemProps {
  user: { _id: string; name: string; avatar?: string };
  handler: (id: string) => void;
  handlerIsLoading: boolean;
  isAdded?: boolean;
  styling?: string;
}

const UserItem = ({
  user,
  handler,
  handlerIsLoading,
  isAdded = false,
  styling = "",
}: UserItemProps) => {
  const { name, _id, avatar } = user;

  return (
    <motion.div
      layout
      className={`flex items-center justify-between gap-4 w-full px-4 py-3 rounded-xl 
        bg-white dark:bg-[#131316] 
        border border-neutral-200/50 dark:border-white/[0.03]
        hover:bg-neutral-50/80 dark:hover:bg-[#19191f]/80
        transition-all duration-200 select-none min-w-0 ${styling}`}
    >
      {/* Avatar Node + Name Stack with Strict Overflow Guards */}
      <div className="flex items-center gap-3.5 min-w-0 flex-grow">
        <div className="relative flex-shrink-0">
          <img
            src={transformImage(avatar)}
            alt={`Identity signature portrait for ${name}`}
            className="w-10 h-10 rounded-full object-cover bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-white/[0.04]"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-grow space-y-0.5">
          <p className="text-[13px] font-semibold tracking-tight text-neutral-800 dark:text-[#ececec] truncate block">
            {name}
          </p>
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block truncate">
            Hellotalk Network Profile Node
          </span>
        </div>
      </div>

      {/* --- RE-ENGINEERED DYNAMIC ACTION TRIGGER KEY --- */}
      <motion.button
        whileHover={{ scale: 1.04, y: -0.5 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => handler(_id)}
        disabled={handlerIsLoading}
        className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-20 disabled:pointer-events-none
          ${
            isAdded
              ? "bg-neutral-50 hover:bg-neutral-100 dark:bg-white/[0.02] border-neutral-200 dark:border-white/[0.05] text-rose-500 dark:text-rose-400 hover:text-rose-600"
              : "bg-neutral-950 hover:bg-neutral-800 dark:bg-[#f3f3f3] dark:hover:bg-white border-transparent text-white dark:text-neutral-950"
          }`}
      >
        {isAdded ? (
          <UserMinus className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
      </motion.button>
    </motion.div>
  );
};

export default memo(UserItem);
