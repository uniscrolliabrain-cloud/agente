/**
 * Stripe billing integration surface.
 *
 * Stub: the typed interface is declared here, but every call fails honestly with 503 until the
 * credential exists and the server wires this client in. Deliberately NOT imported by the runtime
 * yet, so no money movement can ever be attempted through an unconfigured connector.
 */
import { AppError } from "../../../domain/src/errors.ts";

/** Message contract for a connector whose credential is absent: honest 503, never a fake success. */
export const STRIPE_API_KEY_MISSING =
  "Falta STRIPE_API_KEY. Configura la credencial de Stripe en el servidor para usar este conector.";

export interface StripeOptions {
  apiKey?: string;
}

export interface StripeCustomer {
  id: string;
  email?: string;
  name?: string;
}

export interface StripeInvoice {
  id: string;
  customerId: string;
  amountDue: number;
  currency: string;
  status: string;
}

export interface StripePaymentLink {
  id: string;
  url: string;
  amount: number;
  currency: string;
}

export class StripeClient {
  constructor(private readonly options: StripeOptions = {}) {}

  /** True only when a credential was supplied; presence of the key does not prove it works. */
  get configured(): boolean {
    return typeof this.options.apiKey === "string" && this.options.apiKey.trim().length > 0;
  }

  async listCustomers(limit = 25): Promise<StripeCustomer[]> {
    void limit;
    return this.unavailable();
  }

  async listInvoices(customerId: string): Promise<StripeInvoice[]> {
    void customerId;
    return this.unavailable();
  }

  async createPaymentLink(amount: number, currency: string): Promise<StripePaymentLink> {
    void amount;
    void currency;
    return this.unavailable();
  }

  private unavailable(): never {
    throw new AppError(STRIPE_API_KEY_MISSING, 503);
  }
}
