import React, { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, Users, Bell, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { userNotExists } from "@/redux/reducers/auth";
import {
  setIsMobile,
  setIsNewGroup,
  setIsNotification,
  setIsSearch,
} from "../../redux/reducers/misc";
import { resetNotificationCount } from "@/redux/reducers/chat";
import ToggleThemeBtn from "./ToggleThemeBtn";
import api from "@/utils/axiosInstace.util";

// Lazy dialogs
const SearchDialog = lazy(() => import("@/components/specific/Search.tsx"));
const NotificationDialog = lazy(
  () => import("@/components/specific/Notifications.tsx"),
);
const NewGroupDialog = lazy(() => import("@/components/specific/NewGroup"));

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isSearch, isNotification, isNewGroup } = useSelector(
    (state: any) => state.misc,
  );
  const { notificationCount } = useSelector((state: any) => state.chat);

  const handleMobile = () => dispatch(setIsMobile(true));
  const openSearch = () => dispatch(setIsSearch(true));
  const openNewGroup = () => dispatch(setIsNewGroup(true));
  const openNotification = () => {
    dispatch(setIsNotification(true));
    dispatch(resetNotificationCount());
  };
  const navigateToGroup = () => navigate("/groups");

  const logoutHandler = async () => {
    try {
      const { data } = await api.get(`/user/logout`);
      dispatch(userNotExists());
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {/* Premium Liquid Glass Application Bar */}
      <header className="w-full h-16 border-b border-neutral-200/50 dark:border-white/[0.04] bg-white/70 dark:bg-[#050508]/40 backdrop-blur-xl flex items-center justify-between px-6 sm:px-10 sticky top-0 z-40 transition-colors duration-300">
        {/* Mobile Menu Panel Toggle Key */}
        <button
          className="sm:hidden text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer p-1"
          onClick={handleMobile}
        >
          <Menu size={20} />
        </button>

        {/* Left Segment - Brand Identity Typography */}
        <div className="flex items-center h-full gap-3 justify-center select-none ml-4 sm:ml-0">
          <div className="h-7 w-7 relative flex-shrink-0 group cursor-pointer">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-500/20 to-neutral-400/20 opacity-0 group-hover:opacity-100 blur-xs transition-opacity duration-300" />
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain dark:brightness-110 relative z-10"
            />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-[#f3f3f3] sm:block hidden">
            Hellotalk
          </h1>
        </div>

        {/* Space Balance Anchor */}
        <div className="flex-grow" />

        {/* Right Segment - Premium Clean Action Elements */}
        <div className="flex items-center gap-1.5 h-full flex-shrink-0">
          <IconBtn
            title="Search network"
            icon={<Search size={16} />}
            onClick={openSearch}
          />
          <IconBtn
            title="New Conversation Room"
            icon={<Plus size={16} />}
            onClick={openNewGroup}
          />
          <IconBtn
            title="Manage Workspace Channels"
            icon={<Users size={16} />}
            onClick={navigateToGroup}
          />
          <IconBtn
            title="Workspace Notifications"
            icon={<Bell size={16} />}
            onClick={openNotification}
            value={notificationCount}
          />
          <IconBtn
            title="Terminate Active Session"
            icon={<LogOut size={16} />}
            onClick={logoutHandler}
          />

          <div className="h-4 w-px bg-neutral-200 dark:bg-white/[0.06] mx-1.5" />

          <ToggleThemeBtn className="flex items-center justify-center p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-white/[0.02] transition-colors" />
        </div>
      </header>

      {/* Lazy Suspense Modal Intercept Overlay Layers */}
      <AnimatePresence>
        {isSearch && (
          <Suspense fallback={<Backdrop />}>
            <SearchDialog />
          </Suspense>
        )}
        {isNotification && (
          <Suspense fallback={<Backdrop />}>
            <NotificationDialog />
          </Suspense>
        )}
        {isNewGroup && (
          <Suspense fallback={<Backdrop />}>
            <NewGroupDialog />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
};

// Reusable Custom Premium Icon Control Key Node
const IconBtn = ({
  title,
  icon,
  onClick,
  value,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  value?: number;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -0.5 }}
      whileTap={{ scale: 0.96 }}
      title={title}
      onClick={onClick}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-white/[0.02] border border-transparent hover:border-neutral-200/50 dark:hover:border-white/[0.03] transition-all duration-200 cursor-pointer flex-shrink-0"
    >
      <div className="flex-shrink-0">{icon}</div>

      {/* Luxury Minimal Warning Dot Flag */}
      {value ? (
        <span className="absolute top-1.5 right-1.5 min-w-4 h-4 flex items-center justify-center bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-[9px] font-bold px-1 rounded-full border border-white dark:border-[#050508] shadow-sm transform translate-x-0.5 -translate-y-0.5">
          {value}
        </span>
      ) : null}
    </motion.button>
  );
};

// Defensively Styled Translucent Backdrop
const Backdrop = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-neutral-950/20 dark:bg-black/40 backdrop-blur-sm z-40"
  />
);

export default Header;
