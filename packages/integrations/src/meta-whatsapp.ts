// META_WHATSAPP_V1 - WhatsApp Cloud API (Meta) para el lado de salida.
//
// El webhook ya entendia Meta, pero la salida solo hablaba Evolution: un tenant
// con numero de Meta recibia mensajes y no podia contestar. Este cliente cierra
// esa mitad con el minimo que usa el motor de aprobaciones: enviar texto y
// marcar como leido.
//
// Misma regla de resultado que el resto de canales: un 4xx es rechazo definitivo
// (se puede corregir y reintentar), un 5xx o un corte de red dejan el envio en
// DESCONOCIDO y no se debe reintentar a ciegas: WhatsApp no acepta una clave de
// idempotencia propia.
import { AppError, OutcomeUnknownError } from "../../domain/src/errors.ts";

const TIMEOUT_MS = 20_000;

export interface MetaWhatsAppOptions {
  token?: string;
  phoneNumberId?: string;
  graphVersion?: string;
  fetch?: typeof fetch;
}

export interface MetaSendResult {
  id: string;
  accepted: true;
  to: string;
}

export class MetaWhatsAppClient {
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: MetaWhatsAppOptions = {}) {
    this.fetcher = options.fetch ?? fetch;
  }

  get configured(): boolean {
    return Boolean(this.options.token?.trim() && this.options.phoneNumberId?.trim());
  }

  private get version(): string {
    return this.options.graphVersion?.trim() || "v21.0";
  }

  private async request(path: string, body: unknown): Promise<unknown> {
    if (!this.configured) {
      throw new AppError(
        "WhatsApp de Meta no configurado: faltan WHATSAPP_TOKEN y WHATSAPP_PHONE_ID",
        503,
      );
    }
    let response: Response;
    try {
      response = await this.fetcher(
        `https://graph.facebook.com/${this.version}/${encodeURIComponent(this.options.phoneNumberId!.trim())}${path}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.options.token!.trim()}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(TIMEOUT_MS),
          redirect: "error",
        },
      );
    } catch {
      throw new OutcomeUnknownError(
        "Meta no confirmo el envio; comprueba el numero antes de reintentar.",
      );
    }
    if (response.status >= 500 || response.status === 408 || response.status === 429) {
      await response.body?.cancel().catch(() => {});
      throw new OutcomeUnknownError(
        "Meta no confirmo el envio; comprueba el numero antes de reintentar.",
      );
    }
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = (payload as { error?: { message?: string } } | null)?.error;
      throw new AppError(
        `Meta rechazo el mensaje: ${(error?.message ?? `HTTP ${response.status}`).slice(0, 200)}`,
        422,
      );
    }
    return payload;
  }

  async sendText(to: string, text: string): Promise<MetaSendResult> {
    const recipient = to.trim().replace(/^\+/, "");
    if (!/^[0-9]{6,20}$/.test(recipient)) throw new AppError("Numero de WhatsApp invalido", 422);
    if (!text.trim() || text.length > 4096) {
      throw new AppError("Texto vacio o demasiado largo (4096 caracteres)", 422);
    }
    const payload = (await this.request("/messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: { preview_url: false, body: text },
    })) as { messages?: { id?: string }[] } | null;
    const id = payload?.messages?.[0]?.id;
    if (!id?.trim()) throw new OutcomeUnknownError("Meta acepto la peticion sin id de mensaje.");
    return { id: id.trim(), accepted: true, to: recipient };
  }

  /** Marca un mensaje entrante como leido (doble check azul). */
  async markRead(messageId: string): Promise<void> {
    if (!/^[A-Za-z0-9._:-]{1,300}$/.test(messageId)) {
      throw new AppError("Id de mensaje invalido", 422);
    }
    await this.request("/messages", {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    });
  }
}
