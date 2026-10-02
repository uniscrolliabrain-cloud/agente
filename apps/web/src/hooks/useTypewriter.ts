// UI_TYPewriter_V1 - hook de typewriter para el chat.
import { useEffect, useRef, useState } from "react";

export function useTypewriter() {
  const [displayed, setDisplayed] = useState("");
  const queueRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);

  const push = (delta: string) => {
    queueRef.current.push(...delta.split(""));
  };

  const reset = () => {
    queueRef.current = [];
    setDisplayed("");
  };

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (queueRef.current.length > 0) {
        const next = queueRef.current.splice(0, 2).join("");
        setDisplayed((prev) => prev + next);
      }
    }, 30);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { displayed, push, reset };
}