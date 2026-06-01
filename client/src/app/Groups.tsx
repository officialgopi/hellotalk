import { Suspense, lazy, memo, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Menu,
  Edit2,
  Check,
  Trash2,
  UserPlus,
  ShieldAlert,
  X,
  Loader2,
  Users,
} from "lucide-react";

import { LayoutLoader } from "@/components/loaders/Loaders";
import AvatarCard from "../components/shared/AvatarCard";
import { useAsyncMutation, useErrors } from "../hooks/hook";
import {
  useChatDetailsQuery,
  useDeleteChatMutation,
  useMyGroupsQuery,
  useRemoveGroupMemberMutation,
  useRenameGroupMutation,
} from "@/redux/api/api";
import { setIsAddMember } from "@/redux/reducers/misc";
import UserItem from "@/components/shared/UserItem";

// --- RIGID TYPESCRIPT CONTRACTS AND DOMAIN MODELS ---
interface MemberNode {
  _id: string;
  name: string;
  avatar?: string;
  username?: string;
}

interface GroupChatModel {
  _id: string;
  name: string;
  avatar?: string[];
  groupChat: boolean;
  members: MemberNode[];
}

interface RTKQueryResult<T> {
  data?: {
    success: boolean;
    data: T;
  };
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

interface RootState {
  misc: {
    isAddMember: boolean;
  };
}

const ConfirmDeleteDialog = lazy(
  () => import("@/components/dialogs/ConfirmDeleteDialog"),
);
const AddMemberDialog = lazy(
  () => import("@/components/dialogs/AddMemberDialog"),
);

const Groups = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("group");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAddMember } = useSelector((state: RootState) => state.misc);

  // Strictly typed data mutation layers hooking directly into Redux state
  const myGroups = useMyGroupsQuery("") as RTKQueryResult<GroupChatModel[]>;
  const groupDetails = useChatDetailsQuery(
    { chatId: chatId || "", populate: true },
    { skip: !chatId },
  ) as RTKQueryResult<GroupChatModel>;

  const [updateGroup, isLoadingGroupName] = useAsyncMutation(
    useRenameGroupMutation,
  );
  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(
    useRemoveGroupMemberMutation,
  );
  const [deleteGroup] = useAsyncMutation(useDeleteChatMutation);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");
  const [members, setMembers] = useState<MemberNode[]>([]);

  const errors = [
    { isError: myGroups.isError, error: myGroups.error },
    { isError: groupDetails.isError, error: groupDetails.error },
  ];
  useErrors(errors as any);

  // Safeguarded lifecycle syncing tracks bound to type validation layers
  useEffect(() => {
    const groupData = groupDetails.data?.data;
    if (groupData) {
      setGroupName(groupData.name || "");
      setGroupNameUpdatedValue(groupData.name || "");
      setMembers(groupData.members || []);
    }
    return () => {
      setGroupName("");
      setGroupNameUpdatedValue("");
      setMembers([]);
      setIsEdit(false);
    };
  }, [groupDetails.data]);

  const navigateBack = () => navigate("/");
  const handleMobile = () => setIsMobileMenuOpen((prev) => !prev);
  const handleMobileClose = () => setIsMobileMenuOpen(false);

  const updateGroupName = () => {
    setIsEdit(false);
    if (
      !groupNameUpdatedValue.trim() ||
      groupNameUpdatedValue === groupName ||
      !chatId
    )
      return;
    updateGroup("Updating group designation...", {
      chatId,
      name: groupNameUpdatedValue,
    });
  };

  const deleteHandler = () => {
    if (!chatId) return;
    deleteGroup("Terminating group directory...", chatId);
    setConfirmDeleteDialog(false);
    navigate("/groups");
  };

  const removeMemberHandler = (userId: string) => {
    if (!chatId) return;
    removeMember("Removing member from channel...", { chatId, userId });
  };

  return myGroups.isLoading ? (
    <LayoutLoader />
  ) : (
    <div className="grid grid-cols-12 h-screen w-full overflow-hidden bg-[#fafafc] dark:bg-[#07070a] text-neutral-900 dark:text-[#f5f5f7] font-sans antialiased relative min-w-0 transition-colors duration-500">
      {/* --- SIDEBAR PANEL DIRECTORY --- */}
      <div className="hidden sm:block sm:col-span-4 md:col-span-3 h-full border-r border-neutral-200/50 dark:border-white/[0.03] min-w-0">
        <GroupsList myGroups={myGroups.data?.data} chatId={chatId} />
      </div>

      {/* --- WORKSPACE ARENA CANVAS --- */}
      <div className="col-span-12 sm:col-span-8 md:col-span-9 h-full flex flex-col min-w-0 relative bg-transparent">
        {/* Cinematic Navigation HUD Bar */}
        <header className="h-16 min-h-16 w-full border-b border-neutral-200/40 dark:border-white/[0.02] bg-white/40 dark:bg-[#07070a]/40 backdrop-blur-xl px-6 flex items-center justify-between relative z-30 flex-shrink-0 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={navigateBack}
              className="w-8 h-8 rounded-lg border border-neutral-200/60 dark:border-white/[0.03] bg-white dark:bg-white/[0.01] flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer flex-shrink-0"
              aria-label="Return to operational core dashboard"
            >
              <ArrowLeft className="w-4 h-4 stroke-[1.8]" />
            </button>
            <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 font-mono hidden sm:inline-block">
              Workspace // Administration
            </span>
          </div>

          <div className="block sm:hidden flex-shrink-0">
            <button
              onClick={handleMobile}
              className="w-8 h-8 rounded-lg border border-neutral-200/60 dark:border-white/[0.03] bg-white dark:bg-white/[0.01] flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Core Settings Deck Interface */}
        <div className="flex-grow overflow-y-auto w-full p-6 sm:p-8 min-w-0 flex flex-col">
          {groupName ? (
            <div className="max-w-3xl w-full mx-auto flex flex-col flex-grow min-w-0 space-y-6">
              {/* --- EDITABLE BRAND BANNER FRAME --- */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#121215]/60 border border-neutral-200/60 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0 shadow-xs min-w-0">
                <div className="flex items-center gap-4 w-full min-w-0">
                  {isEdit ? (
                    <div className="flex items-center w-full gap-2 min-w-0">
                      <input
                        value={groupNameUpdatedValue}
                        onChange={(e) =>
                          setGroupNameUpdatedValue(e.target.value)
                        }
                        className="flex-1 max-w-md px-3 py-2 text-[13px] font-medium rounded-xl border border-neutral-200 dark:border-[#222226] focus-within:border-neutral-900 dark:focus-within:border-neutral-400 bg-neutral-50/50 dark:bg-[#0a0a0c]/50 outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 min-w-0 transition-all"
                        placeholder="Assign replacement channel label..."
                        autoFocus
                      />
                      <button
                        onClick={updateGroupName}
                        disabled={isLoadingGroupName}
                        className="w-9 h-9 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-[#f3f3f3] dark:hover:bg-white text-white dark:text-neutral-950 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 disabled:opacity-30"
                      >
                        {isLoadingGroupName ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/40 dark:border-white/[0.03] flex items-center justify-center text-neutral-400 shrink-0">
                        <Users className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-[#ececec] truncate block">
                          {groupName}
                        </h2>
                        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 block mt-0.5 font-mono tracking-tight uppercase">
                          Systemic Entity Cluster ID //{" "}
                          {chatId?.slice(-6) || "NULL"}
                        </span>
                      </div>
                      <button
                        disabled={isLoadingGroupName}
                        onClick={() => setIsEdit(true)}
                        className="p-1.5 rounded-lg border border-neutral-200/60 dark:border-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.015] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all cursor-pointer flex-shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Horizontal Action Caps Rows */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto flex-shrink-0 justify-end">
                  <button
                    onClick={() => dispatch(setIsAddMember(true))}
                    className="h-9 px-4 rounded-xl text-[12px] font-semibold bg-neutral-950 hover:bg-neutral-800 dark:bg-[#f3f3f3] dark:hover:bg-white text-white dark:text-neutral-950 flex items-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Member
                  </button>
                  <button
                    onClick={() => setConfirmDeleteDialog(true)}
                    className="h-9 px-4 rounded-xl text-[12px] font-semibold bg-rose-50/60 dark:bg-rose-500/10 border border-rose-200/40 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-500/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Terminate Group
                  </button>
                </div>
              </div>

              {/* --- REGISTRY MEMBERS SUBSECTION DECK --- */}
              <div className="flex flex-col flex-grow min-h-0 w-full">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100 dark:border-white/[0.02] flex-shrink-0 select-none">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 font-mono">
                    Enrolled Registry Members
                  </span>
                  <span className="text-[10px] font-bold font-mono tracking-tight px-1.5 py-0.5 rounded-md bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/40 dark:border-white/[0.02] text-neutral-400">
                    COUNT: {members.length} NODES
                  </span>
                </div>

                <div className="flex-grow overflow-y-auto gap-2 flex flex-col pr-0.5 min-w-0 w-full scrollbar-none">
                  {isLoadingRemoveMember ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 flex-grow">
                      <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                      <span className="text-[11px] font-medium font-mono text-neutral-400 uppercase tracking-wider">
                        Syncing membership data...
                      </span>
                    </div>
                  ) : members.length > 0 ? (
                    members.map((item, index) => (
                      <motion.div
                        key={item._id || index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1],
                          delay: Math.min(index * 0.02, 0.12),
                        }}
                        className="w-full min-w-0 flex-shrink-0"
                      >
                        <UserItem
                          handlerIsLoading={isLoadingRemoveMember}
                          user={item}
                          isAdded
                          handler={removeMemberHandler}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 text-center text-[12px] font-medium text-neutral-400 select-none block truncate">
                      No validated profile objects attached to this registry
                      channel tree.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 select-none w-full min-w-0">
              <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/40 dark:border-white/[0.02] flex items-center justify-center text-neutral-400 mb-4 shrink-0">
                <ShieldAlert className="w-4 h-4 stroke-[1.6]" />
              </div>
              <p className="text-[12px] tracking-wide font-medium text-neutral-400 dark:text-neutral-500 max-w-[260px] leading-relaxed">
                Select an active group directory from the sidebar tracker matrix
                to configure network clusters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- PORTAL COMPONENT DIALOG INJECTIONS --- */}
      <AnimatePresence>
        {isAddMember && (
          <Suspense fallback={null}>
            <AddMemberDialog chatId={chatId || ""} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteDialog && (
          <Suspense fallback={null}>
            <ConfirmDeleteDialog
              open={confirmDeleteDialog}
              handleClose={() => setConfirmDeleteDialog(false)}
              deleteHandler={deleteHandler}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Modern Responsive Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-neutral-950/20 dark:bg-black/50 backdrop-blur-md flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleMobileClose}
          >
            <motion.div
              className="w-[300px] max-w-[85vw] bg-white dark:bg-[#111114] border-r border-neutral-200/60 dark:border-white/[0.05] h-full shadow-2xl flex flex-col p-4 pt-16 relative min-w-0"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleMobileClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-neutral-200/60 dark:border-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.015] text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-all cursor-pointer flex-shrink-0"
                aria-label="Close layout drawer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex-grow overflow-y-auto rounded-xl min-w-0">
                <GroupsList myGroups={myGroups.data?.data} chatId={chatId} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- DIRECTORY GROUP NAVIGATION ROWS --- */
interface GroupsListProps {
  myGroups?: GroupChatModel[];
  chatId: string | null;
}

const GroupsList = ({ myGroups = [], chatId }: GroupsListProps) => (
  <div className="w-full h-full overflow-y-auto bg-white dark:bg-[#0e0e11] flex flex-col p-2 gap-1 select-none min-w-0 scrollbar-none">
    <div className="px-3 py-2 mb-1 select-none flex-shrink-0">
      <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 font-mono block">
        Monitored Group Channels
      </span>
    </div>
    {myGroups.length > 0 ? (
      myGroups.map((group) => (
        <GroupListItem group={group} chatId={chatId} key={group._id} />
      ))
    ) : (
      <div className="py-12 text-center text-[12px] font-medium text-neutral-400/80 dark:text-neutral-500/80 select-none block truncate">
        No active group instances registered.
      </div>
    )}
  </div>
);

interface GroupListItemProps {
  group: GroupChatModel;
  chatId: string | null;
}

const GroupListItem = memo(({ group, chatId }: GroupListItemProps) => {
  const { name, avatar, _id } = group;
  const isSelected = chatId === _id;

  return (
    <Link
      to={`?group=${_id}`}
      onClick={(e) => {
        if (isSelected) e.preventDefault();
      }}
      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl border transition-all duration-200 min-w-0 group/item select-none
          ${
            isSelected
              ? "bg-[#2d2d31] border-[#2d2d31] dark:bg-[#e4e4e7] dark:border-[#e4e4e7] text-white dark:text-neutral-950 shadow-sm"
              : "bg-transparent border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/[0.015]"
          }`}
    >
      <div className="shrink-0 transition-transform duration-300 group-hover/item:scale-[1.03]">
        <AvatarCard avatar={avatar} />
      </div>
      <div className="min-w-0 flex-grow">
        <span
          className={`text-[13px] font-semibold tracking-tight truncate block ${isSelected ? "text-white dark:text-neutral-950" : "text-neutral-800 dark:text-[#ececec]"}`}
        >
          {name}
        </span>
        <span
          className={`text-[10px] font-medium tracking-wide mt-0.5 block font-mono truncate ${isSelected ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-400/60"}`}
        >
          OPEN CHAT METRICS
        </span>
      </div>
    </Link>
  );
});

export default Groups;
