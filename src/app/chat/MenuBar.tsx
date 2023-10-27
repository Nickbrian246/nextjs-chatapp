import React, { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Moon, Sun, Users } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { dark } from "@clerk/themes";

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
