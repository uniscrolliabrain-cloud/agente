import { getSession, handleUnauthorized } from "./client";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  url: string;
  createdAt: string;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const session = getSession();
  if (!session) throw new Error("No hay sesión activa");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: form,
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Sesión expirada");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body?.error === "string" ? body.error : `Error ${res.status}`);
  }
  return (await res.json()) as UploadedFile;
}

// E2_UPLOAD_PROGRESS_V1 - subida con progreso via XHR.
export function uploadFileWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<UploadedFile> {
  const session = getSession();
  if (!session) return Promise.reject(new Error("No hay sesión activa"));
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files");
    xhr.setRequestHeader("Authorization", `Bearer ${session.token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 401) {
        handleUnauthorized();
        reject(new Error("Sesión expirada"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText) as UploadedFile); }
        catch { reject(new Error("Respuesta inválida")); }
        return;
      }
      let detail = `Error ${xhr.status}`;
      try {
        const body = JSON.parse(xhr.responseText);
        if (typeof body?.error === "string") detail = body.error;
      } catch { /* ignorar */ }
      reject(new Error(detail));
    };
    xhr.onerror = () => reject(new Error("Error de red"));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}