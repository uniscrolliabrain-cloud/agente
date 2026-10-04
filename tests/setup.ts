// TESTS_SETUP_V1 — aísla los tests del exterior.
// Cargado desde package.json > scripts.test con --import.
// Sin esto, los tests que llaman a Gemini reciben 429 del free tier
// y el fallo se confunde con un bug real (ver docs/audits/01-tests/miniaudit.md).

const REAL_FETCH = globalThis.fetch;

const BLOCKED_HOSTS = [
  "generativelanguage.googleapis.com",   // Gemini
  "openrouter.ai",                        // fallback
  "oauth2.googleapis.com",                // OAuth
  "gmail.googleapis.com",                 // Gmail
  "www.googleapis.com",                   // Calendar / Drive
  "api.stripe.com",                       // Stripe
  "graph.facebook.com",                   // WhatsApp Cloud API
];

const allowNetwork = process.env.ALLOW_NETWORK === "1";

if (!allowNetwork) {
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    for (const host of BLOCKED_HOSTS) {
      if (url.includes(host)) {
        throw new Error(
          `[tests/setup] Llamada bloqueada a ${host}. ` +
          `Define ALLOW_NETWORK=1 para permitir, o mockea esta llamada. ` +
          `URL: ${url}`,
        );
      }
    }
    return REAL_FETCH(input, init);
  };
}

export {};
