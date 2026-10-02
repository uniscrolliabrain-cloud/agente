// UI_CASCADE_V1 - hook de cascada. Se aplica solo al primer render.
import { useEffect, useRef } from "react";

export function useCascade(): { className: string } {
  const isFirstRef = useRef(true);
  const classNameRef = useRef("");

  useEffect(() => {
    if (isFirstRef.current) {
      classNameRef.current = "cascade-item";
      isFirstRef.current = false;
    }
  }, []);

  return { className: classNameRef.current };
}