// E2_MULTI_UPLOAD_V1 - cola de subida con maximo 3 concurrentes.
import { useCallback, useRef, useState } from "react";
import { uploadFileWithProgress } from "../api/files";

type ItemStatus = "queued" | "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  status: ItemStatus;
  progress: number;
  error?: string;
}

interface Props {
  onUploaded?: (fileId: string, name: string) => void;
  maxConcurrent?: number;
}

export default function MultiUpload({ onUploaded, maxConcurrent = 3 }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(0);
  const queueRef = useRef<UploadItem[]>([]);

  const update = (id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const pump = useCallback(() => {
    while (activeRef.current < maxConcurrent && queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      activeRef.current += 1;
      update(item.id, { status: "uploading" });
      uploadFileWithProgress(item.file, (pct) => update(item.id, { progress: pct }))
        .then((res) => {
          update(item.id, { status: "done", progress: 100 });
          onUploaded?.(res.id, res.name);
        })
        .catch((err: unknown) => {
          update(item.id, {
            status: "error",
            error: err instanceof Error ? err.message : "Error",
          });
        })
        .finally(() => {
          activeRef.current -= 1;
          pump();
        });
    }
  }, [maxConcurrent, onUploaded]);

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: UploadItem[] = Array.from(files).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      status: "queued",
      progress: 0,
    }));
    setItems((prev) => [...prev, ...next]);
    queueRef.current.push(...next);
    pump();
  };

  return (
    <div className="mu">
      <div className="mu__dropzone">
        <button
          type="button"
          className="mu__pick"
          onClick={() => inputRef.current?.click()}
        >
          Añadir archivos
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {items.length > 0 && (
        <ul className="mu__list">
          {items.map((it) => (
            <li key={it.id} className="mu__item" data-status={it.status}>
              <span className="mu__name" title={it.file.name}>{it.file.name}</span>
              <span className="mu__progress">
                <span className="mu__bar" style={{ width: `${it.progress}%` }} />
              </span>
              <span className="mu__status">
                {it.status === "done" && "✓"}
                {it.status === "error" && "!"}
                {it.status === "uploading" && `${it.progress}%`}
                {it.status === "queued" && "…"}
              </span>
              {it.error && <small className="mu__error">{it.error}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}