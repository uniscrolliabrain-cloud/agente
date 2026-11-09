# FASE-03 — Redacción de documentos v2

> v1 · 2026-10-27 · Estado: current

## Estructura de carpetas destino

```
docs/
├── 01-campania-documentacion/   # Esta campaña (CAMPANA.md + FASE-01..05)
├── 02-producto/
│   ├── PRODUCT.md (v2)
│   ├── ROADMAP.md (v2)
│   └── WHITEPAPER.md (nuevo, raíz)
├── 03-arquitectura/
│   ├── ARCHITECTURE.md (v2)
│   ├── KERNEL_SPEC.md (v2)
│   ├── SECURITY.md (v2)
│   └── COMPUTER.md (v2)
├── 04-operaciones/
│   ├── DEPLOY.md (v2)
│   ├── DEPLOY-CLIENTE.md (v2)
│   ├── PRODUCCION.md (v2)
│   ├── ONBOARDING-CLIENTE.md (v2)
│   ├── CLIENTE.md (v2)
│   ├── HANDOFF-CLINE.md (mover desde docs/operacion/)
│   └── CAMPANA-VERDAD.md (mover desde docs/operacion/)
├── 05-desarrollo/
│   ├── CONTRIBUTING.md (v2)
│   ├── PROTOCOLO.md (v2)
│   ├── ENV-VARS.md (nuevo)
│   ├── TESTING.md (nuevo)
│   └── SCRIPTS.md (nuevo)
├── 06-api/
│   └── ENDPOINTS.md (nuevo)
├── 07-integraciones/
│   ├── WHATSAPP.md (nuevo)
│   ├── GOOGLE.md (nuevo)
│   ├── STRIPE.md (nuevo)
│   └── WORKSPACES.md (nuevo)
├── 08-auditorias/
│   ├── AUDIT_CONTRACTS.md (existente)
│   ├── AUDIT_IDEMPOTENCY.md (existente)
│   ├── AUDIT_TENANT_DEFAULT.md (existente)
│   ├── miniaudits/ (25 ramas, existente)
│   └── gate-estado.md (nuevo)
├── 09-interfaz/
│   ├── UI-REDESIGN.md (v2)
│   ├── UI_ANIMATIONS.md (v2)
│   └── VIEWS_AND_TEMPLATES.md (v2)
└── archive/
    └── 2026-10/
        └── README-ARCHIVE.md
```

## Documentos a crear en FASE-03

### 1. `whitepaper.md` (raíz, nuevo)
Visión ejecutiva para stakeholders. Contenido:
- Qué es Laia: OS agentico para PYMEs y agencias
- Problema que resuelve: automatización de negocio con ROI medible
- Diferencial competitivo: SOPs deterministas, memoria de empresa, tareas durables, kernel cognitivo, UI servida
- Modelo de negocio: 1.200 € instalación + 850 €/mes mantenimiento por cliente
- Casos de uso: resucitar leads, leads fríos, agente clínica, dashboard por empresa
- Roadmap de producto a 12 meses
- Modelo de despliegue: un deployment por cliente, multi-tenant opcional

### 2. `README.md` (raíz, reescrito v2)
- Título, descripción de una línea
- Stack con versiones reales
- Estructura de carpetas real
- Instalación (`pnpm install`, `.env.example`)
- Variables de entorno (catálogo completo)
- Comandos (`pnpm dev`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm beta:smoke`)
- Estado actual: rama activa, campaña en curso, qué falta
- Tests: cuántos pasan, cuántos fallan preexistente
- Convenciones: ramas, marcas de idempotencia, reglas para IAs
- Enlaces a docs por categoría

### 3. `docs/02-producto/ROADMAP.md` (v2)
Roadmap por fases con fechas estimadas. Cada fase: objetivo, entregables, criterios de terminado, dependencias.

### 4. `docs/06-api/ENDPOINTS.md` (nuevo)
Referencia HTTP: tabla con Método | Path | Auth | Descripción | Body request | Body response. Agrupado por dominio: auth, threads, files, google, browsers, events, whatsapp, admin, sop, etc.

### 5. `docs/05-desarrollo/ENV-VARS.md` (nuevo)
Catálogo completo de todas las variables de entorno, basado en `config.ts` y README.

### 6. `docs/05-desarrollo/TESTING.md` (nuevo)
Estrategia de tests, cómo ejecutar, qué falla preexistente y por qué, campañas de limpieza pendientes.

### 7. `docs/07-integraciones/WHATSAPP.md` (nuevo)
Webhook público con firma HMAC, drafts (aprobar/rechazar/enviar), Evolution API.

### 8. `docs/07-integraciones/GOOGLE.md` (nuevo)
OAuth, Gmail, Calendar, Drive, tokens cifrados con AES-256-GCM.

### 9. `docs/07-integraciones/STRIPE.md` (nuevo)
Pagos, webhooks, reconciliación.

### 10. `docs/07-integraciones/WORKSPACES.md` (nuevo)
Catálogo de los 34 workspaces.

### 11. `docs/08-auditorias/gate-estado.md` (nuevo)
Estado de los 7 audits, contratos huérfanos, duplicados de idempotencia, métricas.

### 12. Mover `docs/operacion/HANDOFF-CLINE.md` → `docs/04-operaciones/HANDOFF-CLINE.md`
### 13. Mover `docs/operacion/CAMPANA-VERDAD.md` → `docs/04-operaciones/CAMPANA-VERDAD.md`

## Convención de cabecera

Cada doc nuevo debe comenzar con:
```
> vN · YYYY-MM-DD · Estado: current|draft|archived
```
