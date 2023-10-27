import React, { useEffect, useState } from "react";

export default function useDebounce<T>(value: T, delay: number = 250): T {
  const [deboncedValue, setDeboncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDeboncedValue(value);
    }, delay);

    return () => clearInterval(handler);
  }, [delay, value]);

  return deboncedValue;
}
