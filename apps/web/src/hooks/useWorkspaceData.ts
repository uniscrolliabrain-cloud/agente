import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";

export interface MemoryEntry {
  id: string;
  text: string;
  source?: string;
  createdAt?: string;
}

export interface FileEntry {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  pageCount?: number;
  createdAt?: string;
  source?: string;
  url?: string;
}

interface AgentSnapshot {
  memories: MemoryEntry[];
}

interface WorkspaceSnapshot2 {
  files: FileEntry[];
}

export function useWorkspaceData(enabled: boolean, intervalMs = 5000) {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  // POLL_NO_OP_SETSTATE_V1 - dos peticiones cada 5 s re-renderizaban la app entera
  // aunque el payload fuera identico.
  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [agent, ws] = await Promise.all([
          apiFetch<AgentSnapshot>("/api/agent"),
          apiFetch<WorkspaceSnapshot2>("/api/workspace"),
        ]);
        if (cancelled) return;
        setError(null);
        const signature = JSON.stringify({ memories: agent.memories ?? [], files: ws.files ?? [] });
        if (signature === lastSignatureRef.current) return;
        lastSignatureRef.current = signature;
        setMemories(agent.memories ?? []);
        setFiles(ws.files ?? []);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error cargando workspace");
      }
    };

    void load();
    const i = window.setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(i);
    };
  }, [enabled, intervalMs]);

  return { memories, files, error };
}
