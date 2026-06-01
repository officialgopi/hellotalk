import {
  // User as FaceIcon,
  // AtSign as UserNameIcon,
  Calendar as CalendarIcon,
  FileText as BioIcon,
} from "lucide-react";
import moment from "moment";
import { transformImage } from "@/utils/features";

interface ProfileProps {
  user: {
    name: string;
    username: string;
    bio: string;
    avatar: {
      url: string;
    };
    createdAt: string;
  };
}

const Profile = ({ user }: ProfileProps) => {
  // Convert standard dynamic time parameters to clean, stylized metadata flags
  const registrationDate = user?.createdAt
    ? `Member ${moment(user.createdAt).fromNow()}`
    : "System Node Active";

  return (
    <div className="flex flex-col items-center w-full min-w-0 select-none font-sans bg-transparent">
      {/* --- PRE-COMPUTED GRAPHIC PORTRAIT MATRIX --- */}
      <div className="relative flex flex-col items-center text-center pb-6 border-b border-neutral-200/50 dark:border-white/[0.04] w-full min-w-0">
        <div className="relative group shrink-0">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-neutral-200/40 via-transparent to-neutral-200/40 dark:from-white/[0.03] dark:to-white/[0.03] opacity-100 blur-sm pointer-events-none" />
          <img
            src={transformImage(user?.avatar?.url)}
            alt={`Identity portrait card for ${user?.name || "User Node"}`}
            className="w-24 h-24 rounded-full object-cover relative z-10 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>

        {/* Global Primary Text Elements */}
        <h2 className="mt-4 text-sm font-semibold tracking-tight text-neutral-900 dark:text-[#f3f3f3] block truncate max-w-full px-2">
          {user?.name || "Anonymous Node"}
        </h2>
        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mt-0.5 font-mono tracking-tight lowercase">
          @{user?.username || "identity_unverified"}
        </span>
      </div>

      {/* --- PROFILE REGISTRY FIELDS LIST DECK --- */}
      <div className="w-full flex flex-col divide-y divide-neutral-100 dark:divide-white/[0.02] min-w-0">
        <ProfileLineItem
          heading="Systemic Bio Summary"
          text={user?.bio}
          icon={<BioIcon className="w-3.5 h-3.5" />}
        />
        <ProfileLineItem
          heading="Network Registration Date"
          text={registrationDate}
          icon={<CalendarIcon className="w-3.5 h-3.5" />}
        />
      </div>
    </div>
  );
};

/* Reusable Minimalist Profile Data Row Component */
const ProfileLineItem = ({
  text,
  icon,
  heading,
}: {
  text?: string;
  icon?: React.ReactNode;
  heading: string;
}) => (
  <div className="flex items-start gap-4 py-4 px-1 group/item min-w-0 w-full transition-colors">
    {icon && (
      <div className="text-neutral-400/80 group-hover/item:text-neutral-600 dark:group-hover/item:text-neutral-300 transition-colors shrink-0 mt-0.5 p-1.5 rounded-lg bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/20 dark:border-white/[0.01]">
        {icon}
      </div>
    )}
    <div className="flex flex-col min-w-0 flex-grow space-y-0.5 justify-center">
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 select-none block truncate">
        {heading}
      </span>
      <p className="text-[13px] font-medium leading-relaxed text-neutral-700 dark:text-[#e1e1e6] break-words overflow-wrap-anywhere whitespace-pre-wrap selection:bg-neutral-500/10">
        {text || (
          <span className="text-neutral-300 dark:text-neutral-700 font-mono select-none">
            —
          </span>
        )}
      </p>
    </div>
  </div>
);

export default Profile;
