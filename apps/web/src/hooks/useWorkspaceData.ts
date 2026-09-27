import { useEffect, useState } from "react";
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
        setMemories(agent.memories ?? []);
        setFiles(ws.files ?? []);
        setError(null);
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
