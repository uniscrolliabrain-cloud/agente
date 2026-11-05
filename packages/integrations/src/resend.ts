// RESEND_EMAIL_V1 - email transaccional por Resend.
//
// Antes el unico emisor era un stub que devolvia `skipped`: el signup creaba el
// token de verificacion y nunca lo enviaba, asi que una cuenta nueva no podia
// confirmarse. Este adaptador habla la API real y, cuando no hay credencial,
// dice que no esta configurado en vez de fingir un envio.
//
// Regla de resultado (la misma que Google y WhatsApp): un 4xx es rechazo
// definitivo y se puede reintentar con otro contenido; un 5xx o un fallo de red
// deja el resultado DESCONOCIDO, porque el proveedor pudo aceptarlo. Por eso
// `send` admite Idempotency-Key: reintentar sin ella puede duplicar el email.
import { AppError, OutcomeUnknownError } from "../../domain/src/errors.ts";

const ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 15_000;
const MAX_RECIPIENTS = 50;

export interface EmailAttachment {
  filename: string;
  /** Contenido en base64, como lo espera la API. */
  content: string;
  contentType?: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  /** Clave de idempotencia del emisor: el proveedor no repite el envio. */
  idempotencyKey?: string;
}

export interface EmailSendResult {
  id: string;
  accepted: true;
}

export interface ResendOptions {
  apiKey?: string;
  /** Remitente por defecto; debe ser de un dominio verificado en Resend. */
  from?: string;
  fetch?: typeof fetch;
}

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;

function assertEmail(value: string, field: string): string {
  const trimmed = value.trim();
  if (!EMAIL.test(trimmed) || trimmed.length > 320) {
    throw new AppError(`Email invalido en ${field}`, 422);
  }
  return trimmed;
}

function assertSingleLine(value: string, field: string): string {
  if (!value.trim()) throw new AppError(`Falta ${field}`, 422);
  if (/[\r\n]/.test(value)) throw new AppError(`${field} no admite saltos de linea`, 422);
  return value.trim();
}

export class ResendClient {
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: ResendOptions = {}) {
    this.fetcher = options.fetch ?? fetch;
  }

  get configured(): boolean {
    return Boolean(this.options.apiKey?.trim() && this.options.from?.trim());
  }

  /** Sin credencial no hay envio: 503 con causa, nunca un exito silencioso. */
  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.configured) {
      throw new AppError(
        "Email no configurado: faltan RESEND_API_KEY y/o EMAIL_FROM",
        503,
      );
    }
    const from = assertSingleLine(message.from ?? this.options.from!, "remitente");
    const subject = assertSingleLine(message.subject, "asunto");
    const to = (Array.isArray(message.to) ? message.to : [message.to]).map((value) =>
      assertEmail(value, "destinatario"),
    );
    if (to.length === 0 || to.length > MAX_RECIPIENTS) {
      throw new AppError(`El envio admite entre 1 y ${MAX_RECIPIENTS} destinatarios`, 422);
    }
    if (!message.html.trim()) throw new AppError("El cuerpo html esta vacio", 422);

    const body: Record<string, unknown> = {
      from,
      to,
      subject,
      html: message.html,
      ...(message.text ? { text: message.text } : {}),
      ...(message.replyTo ? { reply_to: assertEmail(message.replyTo, "reply-to") } : {}),
      ...(message.cc?.length ? { cc: message.cc.map((value) => assertEmail(value, "cc")) } : {}),
      ...(message.bcc?.length ? { bcc: message.bcc.map((value) => assertEmail(value, "bcc")) } : {}),
      ...(message.attachments?.length
        ? {
            attachments: message.attachments.map((attachment) => ({
              filename: assertSingleLine(attachment.filename, "nombre de adjunto"),
              content: attachment.content,
              ...(attachment.contentType ? { content_type: attachment.contentType } : {}),
            })),
          }
        : {}),
      ...(message.headers ? { headers: message.headers } : {}),
    };

    let response: Response;
    try {
      response = await this.fetcher(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.apiKey!.trim()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "error",
      });
    } catch {
      // Pudo llegar: el reintento necesita la misma Idempotency-Key.
      throw new OutcomeUnknownError(
        "Resend no confirmo el envio; revisa la bandeja antes de reintentar.",
      );
    }

    if (response.status >= 500 || response.status === 408 || response.status === 429) {
      await response.body?.cancel().catch(() => {});
      throw new OutcomeUnknownError(
        "Resend no confirmo el envio; revisa la bandeja antes de reintentar.",
      );
    }

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; name?: string }
      | null;

    if (!response.ok) {
      const detail = payload?.message ?? payload?.name ?? `HTTP ${response.status}`;
      throw new AppError(`Resend rechazo el envio: ${detail.slice(0, 200)}`, 422);
    }
    if (!payload?.id?.trim()) {
      throw new OutcomeUnknownError("Resend acepto la peticion sin devolver id de mensaje.");
    }
    return { id: payload.id.trim(), accepted: true };
  }
}
