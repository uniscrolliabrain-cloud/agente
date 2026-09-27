
// Cliente de embeddings. Usa la API de Google (Gemini).
// Devuelve null si no hay API key o si falla la llamada.

const MODEL = "text-embedding-004";

function apiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
}

export function embeddingsConfigured(): boolean {
  return Boolean(apiKey());
}

export async function embed(text: string): Promise<number[] | null> {
  const key = apiKey();
  if (!key) return null;
  const trimmed = text.trim().slice(0, 10000);
  if (!trimmed) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${MODEL}`,
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
