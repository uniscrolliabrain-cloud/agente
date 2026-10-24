/**
 * WhatsApp Business via Evolution API. Si no hay WHATSAPP_API_KEY + WHATSAPP_BASE_URL,
 * cada metodo lanza AppError 503 honesto. Nunca devuelve exito falso.
 */
import { AppError } from "../../../domain/src/errors.ts";

export const WHATSAPP_NOT_CONFIGURED =
  "Falta WHATSAPP_API_KEY o WHATSAPP_BASE_URL. Configura la credencial y la URL de Evolution API en el servidor.";

export interface WhatsAppOptions {
  apiKey?: string;
  baseUrl?: string;
  instance?: string;
}

export interface WhatsAppSendResult {
  id: string;
  accepted: boolean;
  to: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: string;
}

export class WhatsAppClient {
  constructor(private readonly options: WhatsAppOptions = {}) {}

  get configured(): boolean {
    return Boolean(this.options.apiKey?.trim() && this.options.baseUrl?.trim() && this.options.instance?.trim());
  }

  private url(path: string): string {
    const base = this.options.baseUrl!.replace(/\/+$/, "");
    const instance = encodeURIComponent(this.options.instance!);
    return `${base}/message/${path}/${instance}`;
  }

  private async request(path: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
    if (!this.configured) throw new AppError(WHATSAPP_NOT_CONFIGURED, 503);
    let response: Response;
    try {
      response = await fetch(this.url(path), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.options.apiKey!,
        },
        body: JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
        redirect: "error",
      });
    } catch {
      throw new AppError("No se pudo contactar con Evolution API", 502);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new AppError(`Evolution API respondio ${response.status}: ${text.slice(0, 200)}`, 502);
    }
    return response.json().catch(() => ({}));
  }

  async sendText(to: string, text: string, signal?: AbortSignal): Promise<WhatsAppSendResult> {
    const trimmed = to.trim();
    if (!/^\\+?[0-9]{6,20}$/.test(trimmed)) throw new AppError("Numero de WhatsApp invalido", 422);
    if (!text.trim() || text.length > 4000) throw new AppError("Texto vacio o demasiado largo", 422);
    const result = (await this.request("sendText", { number: trimmed, text }, signal)) as {
      key?: { id?: string };
    };
    return { id: result.key?.id ?? "", accepted: Boolean(result.key?.id), to: trimmed };
  }
}
