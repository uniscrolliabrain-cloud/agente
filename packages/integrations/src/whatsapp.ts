/**
 * WhatsApp Business (Cloud API) integration surface.
 *
 * Stub: the typed interface is declared here, but every call fails honestly with 503 until the
 * credential exists and the server wires this client in. Deliberately NOT imported by the runtime
 * yet: no message can be sent or read through a connector that has no configured credential.
 */
import { AppError } from "../../../apps/server/src/errors.ts";

/** Message contract for a connector whose credential is absent: honest 503, never a fake success. */
export const WHATSAPP_API_KEY_MISSING =
  "Falta WHATSAPP_API_KEY. Configura la credencial de WhatsApp Business en el servidor para usar este conector.";

export interface WhatsAppOptions {
  apiKey?: string;
  phoneNumberId?: string;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: string;
}

export interface WhatsAppSendResult {
  id: string;
  accepted: boolean;
}

export class WhatsAppClient {
  constructor(private readonly options: WhatsAppOptions = {}) {}

  /** True only when a credential was supplied; presence of the key does not prove it works. */
  get configured(): boolean {
    return typeof this.options.apiKey === "string" && this.options.apiKey.trim().length > 0;
  }

  async sendText(to: string, text: string): Promise<WhatsAppSendResult> {
    void to;
    void text;
    return this.unavailable();
  }

  async listMessages(limit = 25): Promise<WhatsAppMessage[]> {
    void limit;
    return this.unavailable();
  }

  async markRead(messageId: string): Promise<{ id: string; read: boolean }> {
    void messageId;
    return this.unavailable();
  }

  private unavailable(): never {
    throw new AppError(WHATSAPP_API_KEY_MISSING, 503);
  }
}
