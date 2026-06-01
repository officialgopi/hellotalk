import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useInputValidation } from "6pp";
import { useAvailableFriendsQuery, useNewGroupMutation } from "@/redux/api/api";
import { useAsyncMutation, useErrors } from "@/hooks/hook";
import { setIsNewGroup } from "@/redux/reducers/misc";
import { toast } from "sonner";
import UserItem from "@/components/shared/UserItem";
import Modal from "@/components/ui/Modal"; // 🔥 reused modal
import { createPortal } from "react-dom";

const NewGroup = () => {
  const { isNewGroup } = useSelector((state: any) => state.misc);
  const dispatch = useDispatch();

  const { isError, isLoading, error, data } = useAvailableFriendsQuery("", {
    skip: !isNewGroup,
  });
  const [newGroup, isLoadingNewGroup]: any =
    useAsyncMutation(useNewGroupMutation);

  const groupName = useInputValidation("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const errors = [{ isError, error }];
  useErrors(errors as any);

  const selectMemberHandler = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((curr) => curr !== id) : [...prev, id],
    );
  };

  const submitHandler = () => {
    if (!groupName.value) return toast.error("Group name is required");

    if (selectedMembers.length < 2)
      return toast.error("Please Select Atleast 3 Members");

    newGroup("Creating New Group...", {
      name: groupName.value,
      members: selectedMembers,
    });

    closeHandler();
  };

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };

  return createPortal(
    <Modal isOpen={isNewGroup} onClose={closeHandler}>
      {/* Title */}
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 text-center">
        New Group
      </h2>
      {/* Group Name Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-neutral-700 dark:text-neutral-300">
          Group Name
        </label>
        <input
          type="text"
          value={groupName.value}
          onChange={groupName.changeHandler}
          placeholder="Enter group name..."
          className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
        />
      </div>

      {/* Members */}
      <div>
        <p className="mb-2 text-sm text-neutral-700 dark:text-neutral-300">
          Members
        </p>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-400 dark:scrollbar-thumb-neutral-700">
          {isLoading ? (
            <>
              <div className="h-10 bg-neutral-300 dark:bg-neutral-800 animate-pulse rounded-md" />
              <div className="h-10 bg-neutral-300 dark:bg-neutral-800 animate-pulse rounded-md" />
            </>
          ) : (
            data?.data?.map((i: any) => (
              <UserItem
                user={i}
                key={i._id}
                handlerIsLoading={false}
                handler={selectMemberHandler}
                isAdded={selectedMembers.includes(i._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={closeHandler}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
        >
          Cancel
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={submitHandler}
          disabled={isLoadingNewGroup}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-900 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-50"
        >
          Create
        </motion.button>
      </div>
    </Modal>,
    document.body,
  );
};

export default NewGroup;
