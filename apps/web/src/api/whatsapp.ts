import { apiFetch } from "./client";
export interface WhatsAppDraft {
  id: string; to: string; text: string; status: string; revision: string | null;
  createdAt?: string; expiresAt?: string; providerId?: string; errorCode?: string;
  needsReprepare: boolean; requiresReconciliation: boolean;
  reconciliation?: { result: string; evidenceRef: string; actorId: string; at: string };
}
export interface WhatsAppConnection {
  provider: string; instance: string; generation: string;
  enabled: boolean; outboundEnabled: boolean; allowedRecipients: string[];
}
export const listWhatsAppDrafts = (signal?: AbortSignal) => apiFetch<{ drafts: WhatsAppDraft[] }>("/api/whatsapp/drafts", { signal });
export const getWhatsAppConnection = (signal?: AbortSignal) => apiFetch<WhatsAppConnection>("/api/whatsapp/connection", { signal });
export const prepareWhatsApp = (to: string, text: string, intentKey: string) => apiFetch<{ draft: WhatsAppDraft }>("/api/whatsapp/drafts", {
  method: "POST", headers: { "Idempotency-Key": intentKey }, body: { to, text },
});
export const decideWhatsApp = (draft: WhatsAppDraft, decision: "send" | "reject") => apiFetch<{ status: string; requiresReconciliation?: boolean }>(
  `/api/whatsapp/drafts/${encodeURIComponent(draft.id)}/${decision}`, { method: "POST", body: { revision: draft.revision } });
export const reconcileWhatsApp = (draft: WhatsAppDraft, result: "provider_accepted" | "confirmed_not_sent", evidenceRef: string, providerId?: string) =>
  apiFetch(`/api/whatsapp/drafts/${encodeURIComponent(draft.id)}/reconcile`, { method: "POST", body: {
    revision: draft.revision, result, evidenceRef, ...(providerId ? { providerId } : {}), providerChecked: true,
  } });
