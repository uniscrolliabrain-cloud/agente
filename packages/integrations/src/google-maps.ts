// GOOGLE_PLACES_V1 - descubrimiento de negocios locales (leads) con Places API.
//
// La key ya estaba en el entorno pero el repo no la usaba: la campana de leads
// dependia de que alguien copiara negocios a mano. Esto devuelve una lista
// normalizada y deduplicable por `placeId`, que es el unico identificador
// estable de Google.
//
// Solo lectura y sin coste oculto: se pide un FieldMask explicito porque Places
// factura por campo, y se limita el numero de resultados.
import { AppError } from "../../domain/src/errors.ts";

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const TIMEOUT_MS = 15_000;
const FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.businessStatus",
].join(",");

// PLACES_FIELD_BUDGET_V1 (campana 17) - el FieldMask es el presupuesto: se
// piden solo los campos que la ficha usa y se limita cada pagina a 20.
export const PLACES_FIELD_MASK = FIELDS;
export const PLACES_MAX_RESULTS = 20;

export interface PlaceLead {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  mapsUrl?: string;
  /** Estado del negocio en Google (OPERATIONAL, CLOSED...). */
  businessStatus?: string;
  /** Alias del estado, conservado para callers previos a la campana 17. */
  status?: string;
}

export interface PlaceSearchInput {
  query: string;
  /** 1..20; Places no admite mas por pagina y la factura sube por resultado. */
  limit?: number;
  language?: string;
  region?: string;
}

export interface GoogleMapsOptions {
  apiKey?: string;
  fetch?: typeof fetch;
}

export class GoogleMapsClient {
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: GoogleMapsOptions = {}) {
    this.fetcher = options.fetch ?? fetch;
  }

  get configured(): boolean {
    return Boolean(this.options.apiKey?.trim());
  }

  async searchLeads(input: PlaceSearchInput): Promise<PlaceLead[]> {
    if (!this.configured) {
      throw new AppError("Leads no configurado: falta GOOGLE_MAPS_API_KEY", 503);
    }
    const query = input.query.trim();
    if (query.length < 3 || query.length > 500) {
      throw new AppError("La busqueda necesita entre 3 y 500 caracteres", 422);
    }
    const limit = Math.min(Math.max(input.limit ?? PLACES_MAX_RESULTS, 1), PLACES_MAX_RESULTS);

    let response: Response;
    try {
      response = await this.fetcher(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": this.options.apiKey!.trim(),
          "X-Goog-FieldMask": PLACES_FIELD_MASK,
          Accept: "application/json",
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: limit,
          languageCode: input.language ?? "es",
          ...(input.region ? { regionCode: input.region } : {}),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "error",
      });
    } catch {
      throw new AppError("No se pudo alcanzar Google Places", 502);
    }
    const payload = (await response.json().catch(() => null)) as
      | { places?: unknown[]; error?: { message?: string; status?: string } }
      | null;
    if (!response.ok) {
      // El caso tipico es la API desactivada en el proyecto: el mensaje de
      // Google lo dice y ahorra media hora de busqueda.
      const detail = payload?.error?.message ?? `HTTP ${response.status}`;
      throw new AppError(`Google Places rechazo la busqueda: ${detail.slice(0, 200)}`, 502);
    }

    const places = Array.isArray(payload?.places) ? payload.places : [];
    return places.flatMap((raw) => {
      const row = (raw ?? {}) as Record<string, unknown>;
      if (typeof row.id !== "string" || !row.id.trim()) return [];
      const display = row.displayName as { text?: string } | undefined;
      const name = typeof display?.text === "string" ? display.text.trim() : "";
      if (!name) return [];
      return [
        {
          placeId: row.id,
          name,
          address: typeof row.formattedAddress === "string" ? row.formattedAddress : "",
          ...(typeof row.internationalPhoneNumber === "string"
            ? { phone: row.internationalPhoneNumber }
            : typeof row.nationalPhoneNumber === "string"
              ? { phone: row.nationalPhoneNumber }
              : {}),
          ...(typeof row.websiteUri === "string" ? { website: row.websiteUri } : {}),
          ...(typeof row.rating === "number" ? { rating: row.rating } : {}),
          ...(typeof row.userRatingCount === "number" ? { reviews: row.userRatingCount } : {}),
          ...(typeof row.googleMapsUri === "string" ? { mapsUrl: row.googleMapsUri } : {}),
          ...(typeof row.businessStatus === "string"
            ? { businessStatus: row.businessStatus, status: row.businessStatus }
            : {}),
        },
      ];
    });
  }
}
