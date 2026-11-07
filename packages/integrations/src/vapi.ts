// VAPI_VOICE_V1 - agente de telefono (llamadas salientes y consulta de estado).
//
// Vapi no tenia cliente: solo una variable en .env.example. Aqui esta el puerto
// minimo que necesita un vertical de agencia: crear una llamada con un asistente,
// consultarla y colgarla.
//
// El detalle que importa: si la peticion falla por red o el proveedor responde
// 5xx, la llamada PUDO haberse marcado. Eso es OutcomeUnknownError, no un error
// normal: reintentar sin comprobar antes puede llamar dos veces al mismo lead.
import { AppError, OutcomeUnknownError } from "../../domain/src/errors.ts";

const BASE = "https://api.vapi.ai";
const TIMEOUT_MS = 20_000;

/** E.164 sin espacios: +34600111222. */
const E164 = /^\+[1-9][0-9]{6,14}$/;

export interface VapiAssistant {
  id: string;
  name?: string;
  firstMessage?: string;
}

export interface VapiCallRequest {
  /** Por defecto, el VAPI_ASSISTANT_ID del entorno. */
  assistantId?: string;
  /** Numero emisor de la cuenta; si falta, Vapi usa el del asistente. */
  phoneNumberId?: string;
  customer: { number: string; name?: string };
  /** Se devuelve en el webhook: util para atar la llamada al lead y al tenant. */
  metadata?: Record<string, string | number | boolean>;
}

export interface VapiCall {
  id: string;
  status?: string;
  type?: string;
  createdAt?: string;
  endedAt?: string;
  assistantId?: string;
  customer?: { number?: string; name?: string };
  endedReason?: string;
}

export interface VapiOptions {
  apiKey?: string;
  assistantId?: string;
  phoneNumberId?: string;
  fetch?: typeof fetch;
}

function assertPhone(value: string, field: string): string {
  const trimmed = value.trim();
  if (!E164.test(trimmed)) {
    throw new AppError(`${field} debe ser E.164 (por ejemplo +34600111222)`, 422);
  }
  return trimmed;
}

function mapCall(value: unknown): VapiCall {
  const row = (value ?? {}) as Record<string, unknown>;
  if (typeof row.id !== "string" || !row.id.trim()) {
    throw new OutcomeUnknownError("Vapi respondio sin id de llamada.");
  }
  return {
    id: row.id,
    ...(typeof row.status === "string" ? { status: row.status } : {}),
    ...(typeof row.type === "string" ? { type: row.type } : {}),
    ...(typeof row.createdAt === "string" ? { createdAt: row.createdAt } : {}),
    ...(typeof row.endedAt === "string" ? { endedAt: row.endedAt } : {}),
    ...(typeof row.assistantId === "string" ? { assistantId: row.assistantId } : {}),
    ...(typeof row.endedReason === "string" ? { endedReason: row.endedReason } : {}),
    ...(row.customer && typeof row.customer === "object"
      ? { customer: row.customer as VapiCall["customer"] }
      : {}),
  };
}

export class VapiClient {
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: VapiOptions = {}) {
    this.fetcher = options.fetch ?? fetch;
  }

  get configured(): boolean {
    return Boolean(this.options.apiKey?.trim());
  }

  get assistantId(): string | undefined {
    return this.options.assistantId?.trim() || undefined;
  }

  private async request(path: string, method: string, body?: unknown): Promise<unknown> {
    if (!this.configured) {
      throw new AppError("Voz no configurada: falta VAPI_API_KEY", 503);
    }
    let response: Response;
    try {
      response = await this.fetcher(`${BASE}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.options.apiKey!.trim()}`,
          Accept: "application/json",
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "error",
      });
    } catch {
      if (method === "GET") throw new AppError("No se pudo alcanzar Vapi", 502);
      throw new OutcomeUnknownError(
        "Vapi no confirmo la operacion; comprueba las llamadas antes de reintentar.",
      );
    }
    if (response.status >= 500 || response.status === 408 || response.status === 429) {
      await response.body?.cancel().catch(() => {});
      if (method === "GET") throw new AppError("Vapi no responde", 502);
      throw new OutcomeUnknownError(
        "Vapi no confirmo la operacion; comprueba las llamadas antes de reintentar.",
      );
    }
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const detail =
        (payload as { message?: string } | null)?.message ??
        (Array.isArray(payload) ? JSON.stringify(payload) : `HTTP ${response.status}`);
      throw new AppError(`Vapi rechazo la operacion: ${String(detail).slice(0, 200)}`, 422);
    }
    return payload;
  }

  async listAssistants(limit = 100): Promise<VapiAssistant[]> {
    const payload = await this.request(`/assistant?limit=${Math.min(Math.max(limit, 1), 100)}`, "GET");
    if (!Array.isArray(payload)) return [];
    return payload
      .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
      .filter((row) => typeof row.id === "string")
      .map((row) => ({
        id: row.id as string,
        ...(typeof row.name === "string" ? { name: row.name } : {}),
        ...(typeof row.firstMessage === "string" ? { firstMessage: row.firstMessage } : {}),
      }));
  }

  /** Marca una llamada saliente. El id devuelto es la unica prueba de que existe. */
  async createCall(request: VapiCallRequest): Promise<VapiCall> {
    const assistantId = request.assistantId?.trim() || this.assistantId;
    if (!assistantId) {
      throw new AppError("Falta VAPI_ASSISTANT_ID: elige el asistente que atendera la llamada", 503);
    }
    const number = assertPhone(request.customer.number, "destinatario");
    const body = {
      assistantId,
      customer: { number, ...(request.customer.name ? { name: request.customer.name } : {}) },
      ...(request.phoneNumberId?.trim() || this.options.phoneNumberId?.trim()
        ? { phoneNumberId: request.phoneNumberId?.trim() || this.options.phoneNumberId!.trim() }
        : {}),
      ...(request.metadata ? { metadata: request.metadata } : {}),
    };
    return mapCall(await this.request("/call", "POST", body));
  }

  async getCall(id: string): Promise<VapiCall> {
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(id)) throw new AppError("Id de llamada invalido", 422);
    return mapCall(await this.request(`/call/${encodeURIComponent(id)}`, "GET"));
  }

  /** Cuelga una llamada en curso. Solo se usa despues de comprobar que sigue viva. */
  async hangUp(id: string): Promise<VapiCall> {
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(id)) throw new AppError("Id de llamada invalido", 422);
    return mapCall(await this.request(`/call/${encodeURIComponent(id)}`, "DELETE"));
  }
}
