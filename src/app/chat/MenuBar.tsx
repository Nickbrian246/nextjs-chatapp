import React, { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { BellOff, BellRing, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { dark } from "@clerk/themes";
import {
  getCurrentPushSubscription,
  registerPushNotifications,
  unRegisterPushNotification,
} from "@/notifications/pushService";
import { LoadingIndicator } from "stream-chat-react";
import DisappearingMessage from "@/components/DisappearingMessage";

interface MenuBarProps {
  onUserMenu: () => void;
}
export default function MenuBar({ onUserMenu }: MenuBarProps) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center  justify-between  gap-5 border-e border-e-[#DBDDE1] p-2 dark:border-e-gray-800 dark:bg-[#17191c] md:flex-col md:gap-3">
      <UserButton
        afterSignOutUrl="/"
        appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
      />

      <div className=" flex gap-6 md:flex-col">
        <span title="mostrar usuarios">
          <Users onClick={onUserMenu} />
        </span>
        <PushSuscriptionToggleButton />
        <ThemeToggleButton />
      </div>
    </div>
  );
}
function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  if (theme === "dark") {
    return (
      <span
        title="cambiar apariencia"
        className="cursor-pointer"
        onClick={() => setTheme("light")}
      >
        <Moon />
      </span>
    );
  }

  return (
    <>
      <span
        title="cambiar apariencia"
        className="cursor-pointer"
        onClick={() => setTheme("dark")}
      >
        <Sun />
      </span>
    </>
  );
}

function PushSuscriptionToggleButton() {
  const [hasActivePushSuscription, setHasActivePushSuscription] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>();
  useEffect(() => {
    async function getActivePushSucription() {
      const suscription = await getCurrentPushSubscription();
      setHasActivePushSuscription(!!suscription);
    }
    getActivePushSucription();
  }, []);

  async function setPushNotificationsEnable(isEnable: boolean) {
    if (isLoading) return;
    setIsLoading(true);
    setConfirmationMessage(undefined);
    try {
      if (isEnable) {
        await registerPushNotifications();
      } else {
        await unRegisterPushNotification();
      }
      setConfirmationMessage(
        `Notificacioens push ${isEnable ? " enable" : " disable"}`
      );
      setHasActivePushSuscription(isEnable);
    } catch (error) {
      if (isEnable && Notification.permission === "denied") {
        alert("Por favor, habilite las notificaciones push en su navegador.");
      } else {
        alert("Algo salió mal. Por favor, inténtelo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (hasActivePushSuscription === undefined) return null;

  return (
    <>
      <div className="relative">
        {isLoading && (
          <span className=" absolute left-1/2 top-1/2 z-10 -translate-y-1/2 translate-x-1/2">
            <LoadingIndicator />
          </span>
        )}
        {confirmationMessage && (
          <DisappearingMessage className="absolute left-1/2 top-8 z-10 -translate-x-1/2 rounded-lg bg-white px-2 py-1 shadow-md dark:bg-black">
            {confirmationMessage}
          </DisappearingMessage>
        )}
        {hasActivePushSuscription ? (
          <span title="Desactivar notificaciones push en este dispositivo.">
            <BellOff
              className={`cursor-pointer ${isLoading ? "opacity-10" : ""}`}
              onClick={() => {
                setPushNotificationsEnable(false);
              }}
            />
          </span>
        ) : (
          <span title="Activar notificaciones push en este dispositivo">
            <BellRing
              onClick={() => setPushNotificationsEnable(true)}
              className={`cursor-pointer ${isLoading ? "opacity-10" : ""}`}
            />
          </span>
        )}
      </div>
    </>
  );
}
