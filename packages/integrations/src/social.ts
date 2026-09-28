/**
 * Social publishing integration surface.
 *
 * Stub: the typed interface is declared here, but every call fails honestly with 503 until the
 * credential exists and the server wires this client in. Deliberately NOT imported by the runtime
 * yet, so nothing is ever published to a network the server cannot actually reach.
 */
import { AppError } from "../../domain/src/errors.ts";

/** Message contract for a connector whose credential is absent: honest 503, never a fake success. */
export const SOCIAL_API_KEY_MISSING =
  "Falta SOCIAL_API_KEY. Configura la credencial de publicación social en el servidor para usar este conector.";

export interface SocialOptions {
  apiKey?: string;
  networks?: string[];
}

/** A draft that a caller wants published. Kept separate from the publish result. */
export interface SocialPostDraft {
  network: string;
  text: string;
  mediaUrls?: string[];
}

export interface SocialPostResult {
  id: string;
  network: string;
  url?: string;
  publishedAt: string;
}

export class SocialClient {
  constructor(private readonly options: SocialOptions = {}) {}

  /** True only when a credential was supplied; presence of the key does not prove it works. */
  get configured(): boolean {
    return typeof this.options.apiKey === "string" && this.options.apiKey.trim().length > 0;
  }

  async listPosts(network: string, limit = 25): Promise<SocialPostResult[]> {
    void network;
    void limit;
    return this.unavailable();
  }

  async publish(draft: SocialPostDraft): Promise<SocialPostResult> {
    void draft;
    return this.unavailable();
  }

  async deletePost(network: string, postId: string): Promise<{ id: string; deleted: boolean }> {
    void network;
    void postId;
    return this.unavailable();
  }

  private unavailable(): never {
    throw new AppError(SOCIAL_API_KEY_MISSING, 503);
  }
}
