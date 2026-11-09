// Cliente de embeddings. Usa la API de Google (Gemini).
// Devuelve null si no hay API key o si falla la llamada.

const DEFAULT_MODEL = "text-embedding-004";
const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// EMBEDDINGS_ENV_WIRE_V1 - .env.example documenta EMBEDDINGS_LLM_API_KEY,
// EMBEDDINGS_LLM_MODEL y EMBEDDINGS_LLM_BASE_URL, pero este modulo solo leia
// GOOGLE_API_KEY/GEMINI_API_KEY y un modelo hardcodeado. Un deployment que
// siguiera la documentacion se quedaba sin RAG en silencio.
function apiKey(): string | undefined {
  return (
    process.env.EMBEDDINGS_LLM_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim()
  );
}

function modelName(): string {
  return (process.env.EMBEDDINGS_LLM_MODEL?.trim() || DEFAULT_MODEL).replace(/^models\//, "");
}

function baseUrl(): string {
  return (process.env.EMBEDDINGS_LLM_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export function embeddingsConfigured(): boolean {
  return Boolean(apiKey());
}

// EMBEDDINGS_API_KEY_OVERRIDE_V1 - acepta apiKey por tenant (TenantConfig.embeddings).
export async function embed(text: string, apiKeyOverride?: string): Promise<number[] | null> {
  const key = apiKeyOverride?.trim() || apiKey();
  if (!key) return null;
  const trimmed = text.trim().slice(0, 10000);
  if (!trimmed) return null;
  const model = modelName();
  try {
    const res = await fetch(
      `${baseUrl()}/models/${encodeURIComponent(model)}:embedContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          content: { parts: [{ text: trimmed }] },
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { embedding?: { values?: number[] } };
    return data.embedding?.values ?? null;
  } catch {
    return null;
  }
}
