// USE_MEDIA_QUERY_V1 - estado reactivo de una media query.
// Se usa para saber si la barra lateral debe comportarse como drawer (movil)
// o como rail plegable (escritorio) sin duplicar la logica en CSS y en React.
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
