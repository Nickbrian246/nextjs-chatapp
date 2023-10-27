import React, { useEffect, useState } from "react";
import {
  Avatar,
  useChatContext,
  LoadingChannels as LoadingUsers,
} from "stream-chat-react";
//@ts-ignore
import { UserResource } from "@clerk/types";
import { Channel, UserResponse } from "stream-chat";
import { ArrowLeft } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { resolve } from "path";
import useDebounce from "@/hooks/useDebounce";
import Button from "@/components/Button";

interface UsersMenuProps {
  loggedUser: UserResource;
  onCose: () => void;
  onChannelSelected: () => void;
}
export default function UsersMenu({
  loggedUser,
  onCose,
  onChannelSelected,
}: UsersMenuProps) {
  const [users, setUsers] = useState<(UserResponse & { image: string })[]>();
  const { client, setActiveChannel } = useChatContext();
  const [moreUsersLoadind, setMoreUsersLoadind] = useState<boolean>(false);
  const [inputSearch, setInputSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string[]>([]);
  const [endOfPaginationReached, setEndOfPaginationReached] =
    useState<boolean>();
  const inputSearchDebounce = useDebounce(inputSearch);

  const pageSize = 10;

  useEffect(() => {
    async function loadInitialUsers() {
      setUsers(undefined);
      setEndOfPaginationReached(undefined);
      try {
        const response = await client.queryUsers(
          {
            id: { $ne: loggedUser.id },
            ...(inputSearchDebounce
              ? {
                  $or: [
                    { name: { $autocomplete: inputSearchDebounce } },
                    { id: { $autocomplete: inputSearchDebounce } },
                  ],
                }
              : {}),
          },
          {
            id: 1,
          },
          { limit: pageSize + 1 }
        );
        //@ts-ignore
        setUsers(response.users.slice(0, pageSize));
        setEndOfPaginationReached(response.users.length <= pageSize);
      } catch (error) {
        console.log(error);
        alert("error loading users");
      }
    }
    loadInitialUsers();
  }, [client, loggedUser.id, inputSearchDebounce]);

  function handleChannelSelected(channel: Channel) {
    setActiveChannel(channel);
    onChannelSelected();
  }

  async function loadMoreUsers() {
    setMoreUsersLoadind(true);
    try {
      const lastUserId = users?.[users.length - 1].id;
      if (!lastUserId) return;
      const response = await client.queryUsers(
        {
          $and: [
            { id: { $ne: loggedUser.id } },
            { id: { $gt: lastUserId } },
            inputSearchDebounce
              ? {
                  $or: [
                    { name: { $autocomplete: inputSearchDebounce } },
                    { id: { $autocomplete: inputSearchDebounce } },
                  ],
                }
              : {},
          ],
        },
        { id: 1 },
        { limit: pageSize + 1 }
      );
      //@ts-ignore
      setUsers([...users, ...response.users.slice(0, pageSize)]);
      setEndOfPaginationReached(response.users.length <= pageSize);
    } catch (error) {
      console.log(error);
      alert("error al cargar usuarios");
    } finally {
      setMoreUsersLoadind(false);
    }
  }

  async function startChatWithUser(userId: string) {
    try {
      const channel = client.channel("messaging", {
        members: [userId, loggedUser.id],
      });
      await channel.create();
      handleChannelSelected(channel);
    } catch (error) {
      console.log(error);
      alert("error creando un canal");
    }
  }
  async function startGroupChat(members: string[], name?: string) {
    try {
      const channel = client.channel("messaging", {
        members,
        name,
      });
      await channel.create();
      handleChannelSelected(channel);
    } catch (error) {
      console.log(error);
      alert("error al crear grupo");
    }
  }
  return (
    <div
      className="str-chat h-full w-full overflow-y-auto
    border-e border-e-[#DBDDE1]  bg-white dark:bg-black"
    >
      <div className=" flex flex-col p-3">
        <div className="flex items-center gap-3 p-3  text-lg font-bold">
          <ArrowLeft onClick={onCose} className="cursor-pointer" />
          Usuarios
        </div>
        <input
          type="search"
          value={inputSearch}
          placeholder="Buscar usuario"
          className=" rounded-full  border border-gray-300 px-4 py-2"
          onChange={(e) => setInputSearch(e.target.value)}
        />
      </div>
      <div className="px-3">
        {!users && !inputSearchDebounce && <LoadingUsers />}
        {!users && inputSearchDebounce && "Buscando..."}
        {users?.length === 0 && <div>Usuarios no encontrados</div>}
      </div>
      {selectedUser.length > 0 ? (
        <StartGroupChatHeader
          onConfirm={(name) => {
            startGroupChat([loggedUser.id, ...selectedUser], name);
          }}
          onClearSelection={() => {
            setSelectedUser([]);
          }}
        />
      ) : (
        ""
      )}
      {users?.map((user) => (
        <UsersResult
          onUserClicked={() => {
            startChatWithUser(user.id);
          }}
          user={user}
          key={user.id}
          onChangeSelected={(selected) =>
            setSelectedUser(
              selected
                ? [...selectedUser, user.id]
                : selectedUser.filter((userId) => userId !== user.id)
            )
          }
          selected={selectedUser.includes(user.id)}
        />
      ))}
      {endOfPaginationReached === false && (
        <LoadingButton
          onClick={loadMoreUsers}
          loading={moreUsersLoadind}
          className="m-auto"
        >
          Cargar mas usuarios
        </LoadingButton>
      )}
    </div>
  );
}

interface UserResultProps {
  user: UserResponse & { image: string };
  onUserClicked: (userId: string) => void;
  selected?: boolean;
  onChangeSelected: (selected: boolean) => void;
}

function UsersResult({
  onUserClicked,
  user,
  onChangeSelected,
  selected,
}: UserResultProps) {
  return (
    <button
      className=" mb-3 flex w-full items-center gap-2 p-2 hover:bg-[#e9eaed] dark:hover:bg-[#1c1e22]"
      onClick={() => onUserClicked(user.id)}
    >
      <input
        type="checkbox"
        className="mx-1 scale-125"
        checked={selected}
        onChange={(e) => onChangeSelected(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
      <span>
        <Avatar image={user.image} name={user.name || user.id} size={40} />
      </span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {user.name || user.id}
      </span>
      {user.online && <p className="text-xs text-green-500">Online</p>}
    </button>
  );
}

interface StartGroupChatHeaderProps {
  onConfirm: (name?: string) => void;
  onClearSelection: () => void;
}

function StartGroupChatHeader({
  onClearSelection,
  onConfirm,
}: StartGroupChatHeaderProps) {
  const [groupChatNameInput, setGroupChatNameInput] = useState("");

  return (
    <div className="sticky top-0 z-10 flex flex-col  gap-3 bg-white p-3 shadow-sm  dark:border-e-gray-800 dark:bg-[#17191c]">
      <input
        placeholder="Nombre del grupo"
        className="rounded  border  border-gray-300 bg-transparent p-2 dark:border-gray-800  dark:text-white  "
        value={groupChatNameInput}
        onChange={(e) => setGroupChatNameInput(e.target.value)}
      />
      <div className="flex  justify-center gap-2">
        <Button onClick={() => onConfirm(groupChatNameInput)} className="py-1">
          Creatr chat grupal
        </Button>
        <Button
          onClick={() => onClearSelection()}
          className="bg-gray-400 active:bg-gray-500"
        >
          Limpiar seleccion
        </Button>
      </div>
    </div>
  );
}
