// UI_ANIMATED_NUMBER_V1 - numero que cuenta de 0 al valor en 500ms.
import { useEffect, useState } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{displayed.toLocaleString()}</>;
}