import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export default function useInitializeChatClinet() {
  const { user } = useUser();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
    client
      .connectUser(
        {
          id: user.id,
          name: user.fullName || user.id,
          image: user.imageUrl,
        },
        async () => {
          const response = await fetch("/api/get-token");
          if (!response.ok) {
            throw Error("falla al obtener token");
          }
          const body = await response.json();
          return body.token;
        }
      )
      .catch((err) => console.log(err, "fallo al conectar usuario"))
      .then((res) => setChatClient(client));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((err) => console.log(err, "errro"))
        .then((res) => console.log("conexion cerrada"));
    };
  }, [user?.fullName, user?.id, user?.imageUrl]);

  return chatClient;
}
