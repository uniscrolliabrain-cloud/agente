// TESTS_CONFIG_V1 — un unico constructor de Config para los tests.
//
// Config gana campos con cada campana (authz, auditoria, cuotas) y cada test que
// armaba el objeto a mano se quedaba atras: el typecheck fallaba por campos
// ausentes que el test nunca uso. Aqui viven los valores por defecto de test y
// cada fichero declara solo lo que le importa. No lee process.env: los tests no
// deben depender del entorno de quien los ejecuta.
import type { Config } from "../../apps/server/src/config.ts";

export function testConfig(overrides: Partial<Config> = {}): Config {
  const port = 8787;
  const publicUrl = `http://localhost:${port}`;
  return {
    mode: "sample",
    port,
    host: "127.0.0.1",
    publicUrl,
    dataDir: "unused",
    agentBackend: "sample",
    googleRedirectUri: `${publicUrl}/api/google/callback`,
    allowedOrigins: [],
    authProvider: "session",
    supabaseJwtAudience: "authenticated",
    authzEnabled: true,
    fieldClassificationEnabled: true,
    policyCacheTtlMs: 60_000,
    auditTrailEnabled: true,
    recordHistoryEnabled: false,
    ...overrides,
  };
}
