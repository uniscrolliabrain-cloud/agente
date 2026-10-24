/**
 * Stripe billing. Si no hay STRIPE_API_KEY, cada metodo lanza AppError 503 honesto.
 * No implementa webhooks (eso necesita firma y endpoint propio, queda pendiente).
 */
import { AppError } from "../../../domain/src/errors.ts";

export const STRIPE_NOT_CONFIGURED =
  "Falta STRIPE_API_KEY. Configura la credencial en el servidor para usar billing.";

export interface StripeOptions {
  apiKey?: string;
  baseUrl?: string;
}

export interface StripeCustomer {
  id: string;
  email?: string;
  name?: string;
}

export interface StripePaymentLink {
  id: string;
  url: string;
  amount: number;
  currency: string;
}

export interface StripeInvoice {
  id: string;
  customerId: string;
  amountDue: number;
  currency: string;
  status: string;
}

export class StripeClient {
  constructor(private readonly options: StripeOptions = {}) {}

  get configured(): boolean {
    return Boolean(this.options.apiKey?.trim());
  }

  private async post<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
    if (!this.configured) throw new AppError(STRIPE_NOT_CONFIGURED, 503);
    const body = new URLSearchParams(params).toString();
    let response: Response;
    try {
      response = await fetch(`${this.options.baseUrl ?? "https://api.stripe.com"}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
        redirect: "error",
      });
    } catch {
      throw new AppError("No se pudo contactar con Stripe", 502);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new AppError(`Stripe respondio ${response.status}: ${text.slice(0, 200)}`, 502);
    }
    return response.json() as Promise<T>;
  }

  private async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    if (!this.configured) throw new AppError(STRIPE_NOT_CONFIGURED, 503);
    let response: Response;
    try {
      response = await fetch(`${this.options.baseUrl ?? "https://api.stripe.com"}${path}`, {
        headers: { Authorization: `Bearer ${this.options.apiKey}` },
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
        redirect: "error",
      });
    } catch {
      throw new AppError("No se pudo contactar con Stripe", 502);
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new AppError(`Stripe respondio ${response.status}: ${text.slice(0, 200)}`, 502);
    }
    return response.json() as Promise<T>;
  }

  // STRIPE_CUSTOMER_DEDUP_V1 - buscar por email antes de crear + Idempotency-Key.
  async createCustomer(email: string, name: string, signal?: AbortSignal): Promise<StripeCustomer> {
    const listResult = await this.get<{ data: Array<{ id: string; email?: string; name?: string }> }>(
      `/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
      signal,
    ).catch(() => null);
    if (listResult?.data?.[0]) {
      return { id: listResult.data[0].id, email: listResult.data[0].email, name: listResult.data[0].name };
    }
    if (!/^[^@\\s]+@[^@\\s]+$/.test(email)) throw new AppError("Email invalido", 422);
    const result = await this.post<{ id: string; email?: string; name?: string }>(
      "/v1/customers",
      { email, name },
      signal,
    );
    return { id: result.id, email: result.email, name: result.name };
  }

  async createPaymentLink(
    amountCents: number,
    currency: string,
    description: string,
    signal?: AbortSignal,
  ): Promise<StripePaymentLink> {
    if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > 100_000_000)
      throw new AppError("Importe invalido", 422);
    if (!/^[a-z]{3}$/.test(currency)) throw new AppError("Moneda invalida (ISO 4217 en minusculas)", 422);
    const result = await this.post<{ id: string; url: string }>(
      "/v1/payment_links",
      {
        "line_items[0][price_data][currency]": currency,
        "line_items[0][price_data][product_data][name]": description.slice(0, 200),
        "line_items[0][price_data][unit_amount]": String(amountCents),
        "line_items[0][quantity]": "1",
      },
      signal,
    );
    return { id: result.id, url: result.url, amount: amountCents / 100, currency };
  }

  async listInvoices(customerId: string, signal?: AbortSignal): Promise<StripeInvoice[]> {
    if (!/^cus_[A-Za-z0-9]+$/.test(customerId)) throw new AppError("customerId invalido", 422);
    const result = await this.get<{
      data: Array<{ id: string; customer: string; amount_due: number; currency: string; status: string }>;
    }>(`/v1/invoices?customer=${encodeURIComponent(customerId)}&limit=50`, signal);
    return result.data.map((i) => ({
      id: i.id,
      customerId: i.customer,
      amountDue: i.amount_due / 100,
      currency: i.currency,
      status: i.status,
    }));
  }
}
