"use client";
import useWindowSize from "@/hooks/useWindowSize";
import { useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Chat as ChatStream,
  CloseIcon,
  LoadingIndicator,
} from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSideBar from "./ChatSideBar";
import MenuBar from "./MenuBar";
import useInitializeChatClinet from "./useInitializeChatClient";
import { mdBreakpoint } from "@/utils/tailwind";
import { useTheme } from "../ThemeProvider";

export default function Chat() {
  const chatClient = useInitializeChatClinet();
  const { user } = useUser();
  const [chatSideBarOpen, setChatSideBarOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const windowSize = useWindowSize();
  const { theme } = useTheme();

  const isLargeScreen = windowSize.width >= mdBreakpoint;

  useEffect(() => {
    if (windowSize.width >= mdBreakpoint) setChatSideBarOpen(false);
  }, [windowSize.width]);

  const handleSidebarOnclose = useCallback(() => {
    setChatSideBarOpen((prevState) => !prevState);
  }, []);

  const onUserMenu = () => {
    setIsUserMenuOpen((prevState) => !prevState);
  };

  if (!chatClient || !user) {
    return (
      <div className="  flex h-screen items-center justify-center bg-gray-100 dark:bg-black ">
        <LoadingIndicator size={40} />
      </div>
    );
  }
  return (
    <>
      <div className="h-screen overflow-hidden text-black dark:bg-black dark:text-white">
        <ChatStream
          client={chatClient}
          theme={
            theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-ligth"
          }
        >
          <div className="flex h-full flex-col md:flex-row">
            <div className=" hidden h-screen  w-full max-w-[50px] justify-center bg-teal-300  md:visible md:flex">
              <MenuBar onUserMenu={onUserMenu} />
            </div>
            <nav className=" flex h-fit w-full items-center justify-between p-2 md:hidden">
              <button
                onClick={() => {
                  setChatSideBarOpen(!chatSideBarOpen);
                }}
              >
                {chatSideBarOpen ? (
                  <span className="flex items-center gap-1">
                    <CloseIcon />
                    Cerrar
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Menu />
                    Menu
                  </span>
                )}
              </button>
              <div>
                <MenuBar onUserMenu={onUserMenu} />
              </div>
            </nav>
            {!isLargeScreen ? (
              <div
                className={`fixed top-11 z-10 ${
                  chatSideBarOpen ? "flex" : "hidden"
                }`}
              >
                <ChatSideBar
                  isUserMenuOpen={isUserMenuOpen}
                  user={user}
                  show={true}
                  onClose={handleSidebarOnclose}
                  setIsUserMenuOpen={setIsUserMenuOpen}
                />
              </div>
            ) : (
              <ChatSideBar
                isUserMenuOpen={isUserMenuOpen}
                user={user}
                show={true}
                onClose={handleSidebarOnclose}
                setIsUserMenuOpen={setIsUserMenuOpen}
              />
            )}

            <div className=" relative w-full">
              <ChatChannel hideChannelOnThread={!isLargeScreen} />
            </div>
          </div>
        </ChatStream>
      </div>
    </>
  );
}
