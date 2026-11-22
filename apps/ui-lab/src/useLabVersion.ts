import { useCallback, useEffect, useState } from "react";
type Manifest = { version: string; builtAt: string };
function valid(value: unknown): value is Manifest {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string,unknown>;
  return typeof obj.version === "string" && typeof obj.builtAt === "string";
}
export function useLabVersion() {
  const [initial, setInitial] = useState<Manifest|null>(null);
  const [latest, setLatest] = useState<Manifest|null>(null);
  const [error, setError] = useState<string|null>(null);
  const check = useCallback(async () => {
    try {
      const res = await fetch("/version.json?t="+Date.now(), {cache:"no-store",credentials:"same-origin"});
      if(!res.ok) throw new Error("HTTP "+res.status);
      const json:unknown = await res.json();
      if(!valid(json)) throw new Error("Formato de versión no válido");
      setInitial(current=>current??json);
      setLatest(json);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error?cause.message:"No se pudo comprobar la versión");
    }
  },[]);
  useEffect(()=>{
    void check();
    const interval=window.setInterval(()=>{if(!document.hidden) void check();},30000);
    const onVisible=()=>{if(!document.hidden) void check();};
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{clearInterval(interval);document.removeEventListener("visibilitychange",onVisible);};
  },[check]);
  const updateAvailable=Boolean(initial && latest && initial.version!==latest.version && initial.version!=="local");
  return {initial,latest,error,check,updateAvailable};
}
