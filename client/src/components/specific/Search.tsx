import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search as SearchIcon, Users } from "lucide-react";
import { useInputValidation } from "6pp";
import { useAsyncMutation } from "@/hooks/hook";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "@/redux/api/api";
import { setIsSearch } from "@/redux/reducers/misc";
import UserItem from "@/components/shared/UserItem";
import Modal from "@/components/ui/Modal";

interface User {
  _id: string;
  name: string;
  avatar?: string;
  [key: string]: any;
}

interface RootState {
  misc: {
    isSearch: boolean;
  };
}

const Search: React.FC = () => {
  const { isSearch } = useSelector((state: RootState) => state.misc);
  const [searchUser] = useLazySearchUserQuery();

  const [sendFriendRequest, isLoadingSendFriendRequest]: any = useAsyncMutation(
    useSendFriendRequestMutation,
  );

  const dispatch = useDispatch();
  const search = useInputValidation("");
  const [users, setUsers] = useState<User[]>([]);

  const addFriendHandler = async (id: string) => {
    await sendFriendRequest?.("Sending friend request...", { userId: id });
  };

  const searchCloseHandler = () => dispatch(setIsSearch(false));

  // Protected Debounce Loop Core
  useEffect(() => {
    const trimmedValue = search.value.trim();

    if (!trimmedValue) {
      setUsers([]);
      return;
    }

    const timeOutId = setTimeout(() => {
      searchUser(trimmedValue)
        .then(({ data }: any) => {
          setUsers(data?.data || []);
        })
        .catch((e: unknown) => {
          console.error("Directory pipeline execution error:", e);
          setUsers([]);
        });
    }, 400);

    return () => clearTimeout(timeOutId);
    // Explicitly uncoupling mutable action refs to safeguard active typing operations
  }, [search.value]);

  return (
    <Modal isOpen={isSearch} onClose={searchCloseHandler}>
      <div className="flex flex-col w-full min-w-0 select-none font-sans">
        {/* --- BRAND HEADER PROFILE TITLE --- */}
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-neutral-100 dark:border-white/[0.03]">
          <div className="w-7 h-7 rounded-lg bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200/40 dark:border-white/[0.02] flex items-center justify-center text-neutral-400 dark:text-neutral-500 shrink-0">
            <Users className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div className="min-w-0 flex-grow">
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-[#ececec] block truncate">
              Global Directory Explorer
            </h2>
          </div>
        </div>

        {/* --- INPUT SELECTION BAR --- */}
        <div className="flex items-center w-full rounded-xl border border-neutral-200/80 dark:border-[#222226] focus-within:border-neutral-900 dark:focus-within:border-neutral-400 px-3.5 py-2.5 bg-neutral-50/50 dark:bg-[#121215]/50 transition-all duration-300 shadow-xs relative min-w-0 mb-4">
          <SearchIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-2.5 shrink-0 stroke-[1.8]" />
          <input
            type="text"
            value={search.value}
            onChange={search.changeHandler}
            placeholder="Search accounts by name or profile signatures..."
            className="flex-1 bg-transparent border-none outline-none focus:outline-none text-[13px] leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 min-w-0 w-full"
          />
        </div>

        {/* --- SCROLL DIRECTORY BASE LAYER --- */}
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto scrollbar-none pr-0.5 min-w-0 w-full">
          {users.length > 0 ? (
            users.map((item) => (
              <UserItem
                user={item}
                key={item._id}
                handler={addFriendHandler}
                handlerIsLoading={isLoadingSendFriendRequest}
              />
            ))
          ) : search.value.trim() !== "" ? (
            <div className="py-12 text-center text-[12px] font-medium text-neutral-400 dark:text-neutral-500 select-none block truncate">
              No matching profiles authenticated on the active pipeline matrix.
            </div>
          ) : (
            <div className="py-12 text-center text-[12px] font-medium text-neutral-400/80 dark:text-neutral-500/80 select-none block truncate">
              Initialize keystrokes above to scan the directory tree
              infrastructure.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Search;
