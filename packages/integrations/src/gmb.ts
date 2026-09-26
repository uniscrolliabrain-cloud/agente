/**
 * Google Business Profile (GMB/GBP) integration surface.
 *
 * Stub: the typed interface is declared here, but every call fails honestly with 503 until the
 * credential exists and the server wires this client in. Deliberately NOT imported by the runtime
 * yet, so it follows the existing integration convention (see google.ts) instead of pretending the
 * connector works.
 */
import { AppError } from "../../../apps/server/src/errors.ts";

/** Message contract for a connector whose credential is absent: honest 503, never a fake success. */
export const GMB_API_KEY_MISSING =
  "Falta GMB_API_KEY. Configura la credencial de Google Business Profile en el servidor para usar este conector.";

export interface GmbOptions {
  apiKey?: string;
  accountId?: string;
}

export interface GmbProfile {
  name: string;
  accountName: string;
  type: string;
}

export interface GmbLocation {
  name: string;
  title: string;
  storefrontAddress?: string;
}

export interface GmbLocalPost {
  name?: string;
  summary: string;
  languageCode: string;
}

export class GmbClient {
  constructor(private readonly options: GmbOptions = {}) {}

  /** True only when a credential was supplied; presence of the key does not prove it works. */
  get configured(): boolean {
    return typeof this.options.apiKey === "string" && this.options.apiKey.trim().length > 0;
  }

  async listProfiles(): Promise<GmbProfile[]> {
    return this.unavailable();
  }

  async listLocations(accountId: string): Promise<GmbLocation[]> {
    void accountId;
    return this.unavailable();
  }

  async createLocalPost(locationName: string, post: GmbLocalPost): Promise<GmbLocalPost> {
    void locationName;
    void post;
    return this.unavailable();
  }

  async listReviews(locationName: string): Promise<{ name: string; starRating: string }[]> {
    void locationName;
    return this.unavailable();
  }

  private unavailable(): never {
    throw new AppError(GMB_API_KEY_MISSING, 503);
  }
}
