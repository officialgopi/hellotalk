import { memo } from "react";
import { motion } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import {
  useAcceptFriendRequestMutation,
  useGetNotificationsQuery,
} from "../../redux/api/api";
import { setIsNotification } from "@/redux/reducers/misc";
import { UserCheck, UserX, Bell } from "lucide-react";
import { transformImage } from "@/utils/features";
import Modal from "../ui/Modal"; // ✅ use your reusable modal
import { createPortal } from "react-dom";

const Notifications = () => {
  const { isNotification } = useSelector((state: any) => state.misc);
  const dispatch = useDispatch();

  const { isLoading, data, error, isError } = useGetNotificationsQuery("", {
    skip: !isNotification,
  });

  const [acceptRequest]: any = useAsyncMutation(useAcceptFriendRequestMutation);

  const friendRequestHandler = async ({
    _id,
    accept,
  }: {
    _id: string;
    accept: boolean;
  }) => {
    dispatch(setIsNotification(false));
    await acceptRequest("Accepting...", { requestId: _id, accept });
  };

  const closeHandler = () => dispatch(setIsNotification(false));

  useErrors([{ error, isError }] as any);

  return createPortal(
    <Modal isOpen={isNotification} onClose={closeHandler}>
      <div className="text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Bell className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-neutral-300 dark:bg-neutral-800 animate-pulse rounded-md" />
            <div className="h-12 bg-neutral-300 dark:bg-neutral-800 animate-pulse rounded-md" />
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="space-y-3">
            {data.data.map(({ sender, _id }: any) => (
              <NotificationItem
                key={_id}
                sender={sender}
                _id={_id}
                handler={friendRequestHandler}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-400">0 notifications</p>
        )}
      </div>
    </Modal>,
    document.body,
  );
};

const NotificationItem = memo(
  ({
    sender,
    _id,
    handler,
  }: {
    sender: { name: string; avatar?: string };
    _id: string;
    handler: ({ _id, accept }: { _id: string; accept: boolean }) => void;
  }) => {
    const { name, avatar } = sender;

    return (
      <motion.div
        layout
        className="flex items-center justify-between gap-3 p-3 rounded-md bg-neutral-200 dark:bg-neutral-800 hover:dark:bg-neutral-700 hover:bg-neutral-300 transition"
      >
        {/* Avatar + Text */}
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={transformImage(avatar)}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <p className="truncate">{name} sent you a friend request.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handler({ _id, accept: true })}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <UserCheck size={16} /> Accept
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handler({ _id, accept: false })}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            <UserX size={16} /> Reject
          </motion.button>
        </div>
      </motion.div>
    );
  },
);

export default Notifications;
