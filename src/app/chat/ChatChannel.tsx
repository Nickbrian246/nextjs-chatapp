import React from "react";
import {
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  LoadingIndicator,
  ChannelList,
} from "stream-chat-react";
import UsersMenu from "./UsersMenu";
import CustomChannelHeader from "./CustomChannelHeader";
interface ChatChannelProps {
  hideChannelOnThread: boolean;
}

export default function ChatChannel({ hideChannelOnThread }: ChatChannelProps) {
  return (
    <>
      <Channel>
        <Window hideOnThread={hideChannelOnThread}>
          {/* <ChannelHeader /> */}
          <CustomChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </>
  );
}
