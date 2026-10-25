# Vertical slice — Agencia de IA multi-tenant

Documentación del primer vertical slice del producto: una agencia de IA que vende a sus clientes un asistente multi-canal (chat, WhatsApp, teléfono) con la data de su empresa, captura de leads, agenda de citas, email y Drive.

## Modelo de negocio

- **Owner**: tú (la agencia).
- **Tenants**: cada cliente tuyo.
- **Template**: `clientes/_template/` con placeholders. Tú lo compilas manualmente para cada cliente.
- **Auth**: cada cliente entra con su Google OAuth. Supabase emite el JWT con `tenant_id`. Tu backend aísla por tenant.
- **DB**: Supabase Postgres (Free tier para los primeros 2-3 clientes).

## Documentos

| Doc | Qué contiene |
|---|---|
| [`00-BASELINE.md`](00-BASELINE.md) | Estado real del repo al empezar el vertical slice |
| [`01-ARQUITECTURA.md`](01-ARQUITECTURA.md) | Componentes que usa el vertical slice y qué falta |
| [`02-PLAN-15-SEMANAS.md`](02-PLAN-15-SEMANAS.md) | Bloques 0-8, calendario, criterios de cierre |
| [`03-SUPABASE-JWT.md`](03-SUPABASE-JWT.md) | Supabase Auth + Google OAuth + Custom Access Token Hook + tenant_id en JWT |
| [`04-TEMPLATE-BUNDLE.md`](04-TEMPLATE-BUNDLE.md) | `clientes/_template/bundle.json`, `provision-client.ts`, cómo compilar un cliente |
| [`05-METRICAS-PILOTO.md`](05-METRICAS-PILOTO.md) | Qué medir en el piloto (leads, citas, tiempo, coste) |
| [`06-COMPILADOR-METODO.md`](06-COMPILADOR-METODO.md) | Método del compilador: cuestionario, 7 pasos, cajón versátil. Tú eres el cliente beta. |
| [`07-CUESTIONARIO-EMPRESA.md`](07-CUESTIONARIO-EMPRESA.md) | 132 preguntas para compilar una empresa. Pendiente de responder. |

## Orden de lectura

1. `00-BASELINE.md` — de dónde partes.
2. `01-ARQUITECTURA.md` — qué tienes y qué falta.
3. `02-PLAN-15-SEMANAS.md` — qué haces y cuándo.
4. `03-SUPABASE-JWT.md` — cómo entra el cliente y cómo se aísla.
5. `04-TEMPLATE-BUNDLE.md` — cómo compilas un cliente.
6. `05-METRICAS-PILOTO.md` — cómo mides si funciona.
7. `06-COMPILADOR-METODO.md` — cómo compilas una empresa (tú eres el beta).
8. `07-CUESTIONARIO-EMPRESA.md` — 132 preguntas para responder cuando puedas.

## Regla

Este folder no se reescribe. Se actualiza con evidencia (fichero + línea + marca). Cuando un bloque del plan se cierra, se actualiza el estado en `02-PLAN-15-SEMANAS.md`.