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
