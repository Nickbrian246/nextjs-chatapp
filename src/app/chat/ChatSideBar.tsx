import React, { useCallback } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import UsersMenu from "./UsersMenu";
import { UserResource } from "@clerk/types";
interface ChatSideBarPros {
  user: UserResource;
  show: boolean;
  onClose: () => void;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customActiveChannel?: string;
}

export default function ChatSideBar({
  user,
  show,
  onClose,
  isUserMenuOpen,
  setIsUserMenuOpen,
  customActiveChannel,
}: ChatSideBarPros) {
  const ChannerPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose]
  );
  return (
    <div
      className={`relative w-full md:max-w-[360px] ${show ? "flex" : "hidden"}`}
    >
      {isUserMenuOpen && (
        <div className="absolute  z-20  h-full w-full">
          <UsersMenu
            loggedUser={user}
            onChannelSelected={() => {
              setIsUserMenuOpen((prevValue) => !prevValue);
              onClose();
            }}
            onCose={() => setIsUserMenuOpen((prevValue) => !prevValue)}
          />
        </div>
      )}
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [user.id] },
        }}
        sort={{ last_message_at: -1 }}
        options={{ state: true, presence: true, limit: 10 }}
        customActiveChannel={customActiveChannel}
        showChannelSearch
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: {
                members: { $in: [user.id] },
              },
            },
          },
        }}
        Preview={ChannerPreviewCustom}
      />
    </div>
  );
}
