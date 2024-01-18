import React, { ReactNode, useEffect, useState } from "react";
interface DisappearingMessageProps {
  children: ReactNode;
  duration?: number;
  className?: string;
}
export default function DisappearingMessage({
  children,
  className,
  duration,
}: DisappearingMessageProps) {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timeout);
  }, [duration]);
  return (
    <div
      className={`${
        visible ? "opacity-100" : "opacity-0"
      } w-max transition-opacity duration-500 ${className}`}
    >
      {children}
    </div>
  );
}
