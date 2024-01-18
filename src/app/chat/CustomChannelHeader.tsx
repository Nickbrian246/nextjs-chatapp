import React from "react";
import {
  ChannelHeader,
  ChannelHeaderProps,
  useChannelStateContext,
} from "stream-chat-react";
import { UserResource } from "@clerk/types";
import { Bell, BellOff } from "lucide-react";
import { useUser } from "@clerk/nextjs";
interface Props {}
export default function CustomChannelHeader(props: ChannelHeaderProps) {
  const { user } = useUser();
  const {
    channel: { id: channelId },
  } = useChannelStateContext();
  return (
    <div className=" dat flex items-center justify-between gap-3 bg-white dark:bg-[#17191c]">
      <ChannelHeader {...props} />
      {channelId && user && (
        <ChannelNotificationToggleButton channelId={channelId} user={user} />
      )}
    </div>
  );
}

interface ChannelNotificationToggleButton {
  user: UserResource;
  channelId: string;
}
function ChannelNotificationToggleButton({
  channelId,
  user,
}: ChannelNotificationToggleButton) {
  const mutedChannels = user.unsafeMetadata.mutedChannels || [];
  const channelMuted = mutedChannels?.includes(channelId);

  async function setChannelMuted(channelId: string, muted: boolean) {
    try {
      let mutedChannelsUpdate: string[];
      if (muted) {
        mutedChannelsUpdate = [...mutedChannels, channelId];
      } else {
        mutedChannelsUpdate = mutedChannels.filter((id) => id !== channelId);
      }
      await user.update({
        unsafeMetadata: {
          mutedChannels: mutedChannelsUpdate,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <div className="me-6 ">
        {!channelMuted ? (
          <span title="Silenciar notificaciones del canal">
            <BellOff
              className=" cursor-pointer"
              onClick={() => {
                setChannelMuted(channelId, true);
              }}
            />
          </span>
        ) : (
          <span
            onClick={() => {
              setChannelMuted(channelId, true);
            }}
            title="Activar notificaciones de este canal"
          >
            <Bell />
          </span>
        )}
      </div>
    </>
  );
}
