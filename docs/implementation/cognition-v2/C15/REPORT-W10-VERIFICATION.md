# W10 — Verificación completa del repositorio

SHA probado: 015de17f481978fd9c57d7b93201f581c1d70fe8, árbol limpio al inicio; Node 24.22.1, pnpm 11.25.0, WORKSPACE_MODE=sample y Postgres 17 local sintético. Sin credenciales externas, empresas reales ni despliegues.

| Comando | Resultado | Duración | Casos |
|---|---|---:|---|
| pnpm gate | PASS: 10/10 checks | 895.094 s wall; 892.852 s interno | 853 total, 836 pass, 0 fail, 12 skip, 5 todo, 0 cancel |
| pnpm test:coverage | PASS | 1024.180 s | 853 total, 836 pass, 0 fail, 12 skip, 5 todo, 0 cancel |
| pnpm test:browser | FAIL/BLOCKED_NETWORK | 6.003332 s TAP | 1 total, 0 pass, 1 fail: DNS_UNAVAILABLE en httpbin.org, anterior a la navegación |

Chromium de Playwright instalado en /workspace/.cache/playwright; desaparece el bloqueo por binario ausente, pero el entorno no resuelve el destino público del test. Se mantienen aserción y protección SSRF. No se afirma browser PASS ni se sustituye por un mock.

Cobertura c8 de archivos cargados por la suite (no cobertura universal de todo el repositorio): líneas/statements 37796/51219 = 73.79%; funciones 1587/1962 = 80.88%; branches 6297/8520 = 73.90%. No hay umbral nuevo inventado para declarar certificación. Los 12 omitidos y 5 todo siguen visibles y deben revisarse por campaña.

Evidencia depurada: evidence/W10-COMMANDS.json, GATE-W10-015de17.json y COVERAGE-W10-015de17.json. Logs brutos/variables de conexión no publicados. Un gate de CI verde no equivale a los gates de aceptación C01–C15: shared RLS transversal, capacidades/aprobaciones empresariales V2, proveedores reales, calibración, canary, restore y retirada completa del legacy continúan pendientes. C06 avanza en rama independiente sin atribuirle estos resultados anteriores.
