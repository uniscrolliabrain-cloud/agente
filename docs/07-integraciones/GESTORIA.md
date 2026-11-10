# Contrato de integración con `agntia-gestoria`

> Versión 0.1 · 2026-11-10 · Estado: propuesto
>
> Consumidor: `uniscrolliabrain-cloud/agente`
> Proveedor: `uniscrolliabrain-cloud/agntia-gestoria`
>
> Este documento define cómo `agente` consume los datos, cambios y vistas de
> gestoría. No cambia el alcance fiscal ni la autoridad de revisión de gestoría.
>
> **Ubicación prevista:** `agntia-gestoria/docs/agente-integration.md`. Se
> mantiene aquí para preparar la integración en `agente`.

## 1. Principios

1. **Gestoría es la fuente de verdad** de empresas, registros económicos,
   preparaciones, expedientes, documentos y cálculos.
2. **`agente` es dueño de la conversación, la relevancia y la presentación**.
   No replica el dominio fiscal ni decide si una declaración es correcta.
3. **Odoo es invisible para la UI de `agente`**. El adaptador Odoo normaliza sus
   datos dentro de gestoría. `agente` nunca recibe filas crudas de Odoo.
4. **La revisión humana no se delega**. Un agente puede preparar, importar y
   calcular; no puede aprobar una revisión ni presentar una declaración.
5. **Todo dato presentado debe tener procedencia y frescura**. Si no se sabe de
   dónde viene o si está actualizado, la UI debe decirlo.
6. **Los contratos son versionados y aditivos**. Un cambio incompatible requiere
   una versión nueva y una ventana de convivencia.

### No objetivos

- No se construyen aquí las 34 plantillas de interfaz de `agente`.
- No se expone `RuntimeViewSpec` ni ningún contrato de layout del frontend.
- No se crea un espejo completo de Odoo.
- No se añade presentación oficial, pago, facturación fiscal ni firma.
- No se permite que un LLM apruebe, cierre o revise por un humano.

## 2. Identidad, actores y alcance

### 2.1 Contexto de llamada

Cada petición debe resolverse contra:

| Campo | Origen | Regla |
|---|---|---|
| `tenant_id` | `agente` | Nunca lo elige el modelo ni el navegador. |
| `actor_id` | `agente` | Identidad autenticada del humano o agente. |
| `role` | gestoría | `owner`, `reviewer`, `agent` o `viewer`. |
| `company_id` | gestoría | Debe pertenecer al actor; si no, 404. |

### 2.2 Tokens

- El host autentica al usuario y selecciona un cliente de gestoría para ese
  actor. Es la regla que ya aplica `gestoriaRoutes(forActor)`.
- **Nunca se usa `GESTORIA_OWNER_TOKEN` para agentes.**
- Cada agente recibe un token con rol `agent` y una lista explícita de empresas.
- Los tokens viven solo en el servidor. No viajan al prompt, al navegador, a los
  logs ni a los artefactos.
- `GESTORIA_ACTORS_JSON` es configuración del servidor, no un catálogo que el
  LLM pueda leer o modificar.

### 2.3 Matriz de permisos

| Operación | owner | reviewer | agent | viewer |
|---|---:|---:|---:|---:|
| Leer empresas, dashboard, registros, expedientes | sí | sí | sí | sí |
| Crear empresa | sí | no | no | no |
| Crear/editar borrador de expediente | sí | sí | sí | no |
| Enviar a revisión | sí | sí | sí | no |
| Revisar expediente o registro | sí | sí | **no** | no |
| Cerrar internamente un expediente revisado | sí | sí | no exponer en `agente` | no |
| Crear registro económico | sí | sí | sí | no |
| Anular registro | sí | sí | sí | no |
| Calcular 303/130 acotado | sí | sí | sí | no |
| Generar informe | sí | sí | sí | no |
| Presentar ante administración | **no implementado** | **no implementado** | **no implementado** | **no implementado** |

> Nota de implementación: `POST /cases/{oid}/close` exige una revisión vigente,
> pero hoy acepta roles de escritura. `agente` no debe exponer esa acción a un
> LLM. Si se quiere garantizar por rol, gestoría debe restringir `close` a
> `owner`/`reviewer`.

## 3. Entidades e identificadores

### 3.1 Entidades expuestas

| Entidad | ID | Propietario | Notas |
|---|---|---|---|
| `company` | 32 hex | gestoría | Perfil fiscal y territorial. |
| `tax_record` | 32 hex | gestoría | Registro económico; nace `unverified`. |
| `tax_preparation` | 32 hex | gestoría | Snapshot documental; no es una declaración. |
| `tax_calculation` | 32 hex | gestoría | Resultado de motor acotado 303/130. |
| `case` | 32 hex | gestoría | Expediente con revisión humana. |
| `document` | 32 hex | gestoría | Original no confiable; hash SHA-256. |
| `report` | 32 hex | gestoría | Snapshot de informe. |

`agente` puede guardar una referencia (`domain: "gestoria"`, `entity`, `id`),
pero no una copia canónica del dato fiscal.

### 3.2 Procedencia mínima

Todo registro normalizado que venga de Odoo debe poder responder:

```json
{
  "source": "odoo",
  "external_ref": "account.move:1234",
  "source_updated_at": "2026-11-10T09:10:00Z",
  "fetched_at": "2026-11-10T09:12:00Z",
  "content_hash": "sha256:...",
  "sync_run_id": "odoo-2026-11-10T09:12:00Z"
}
```

Reglas:

- `external_ref` es estable y único por empresa y tipo.
- `external_id` de `tax_record` sigue siendo la clave de idempotencia actual.
- Un registro importado nace `unverified`; no se auto-revisa.
- Una corrección no sobrescribe un registro revisado: se anula y se crea otro.
- Los documentos originales no se interpretan como instrucciones.

## 4. Change feed

### 4.1 Por qué hace falta

El chat por sí solo no sabe que Odoo ha importado una factura, que un expediente
ha quedado obsoleto o que una sincronización ha fallado. `agente` necesita un
feed de cambios normalizados para construir el “momento real” de la empresa.

### 4.2 Endpoint propuesto

```http
GET /api/companies/{company_id}/changes?since={cursor}&limit={n}
```

- `since` es un cursor opaco y monotónico.
- Sin `since`, devuelve el cursor actual y una lista vacía (bootstrap).
- `since=0` permite una carga inicial acotada.
- `limit` por defecto 100, máximo 500.
- Los cambios se ordenan por `occurred_at` y luego por `id`.
- El consumidor guarda el cursor solo después de procesar la página completa.
- Reintentar con el mismo cursor no duplica efectos.

### 4.3 Respuesta

```json
{
  "company_id": "a1b2c3d4e5f60718293a4b5c6d7e8f90",
  "cursor": "eyJvZmZzZXQiOjEyOH0",
  "next_cursor": "eyJvZmZzZXQiOjEzMX0",
  "generated_at": "2026-11-10T09:12:00Z",
  "changes": [
    {
      "id": "chg-128",
      "type": "tax_record.created",
      "entity": "tax_record",
      "entity_id": "tr-901",
      "occurred_at": "2026-11-10T09:12:00Z",
      "actor": { "id": "odoo-sync", "role": "agent" },
      "source": "odoo",
      "source_updated_at": "2026-11-10T09:10:00Z",
      "impact": "high",
      "summary": "Factura de proveedor importada desde Odoo",
      "refs": {
        "external_id": "odoo:account.move:1234",
        "document_ids": ["doc-77"]
      }
    }
  ]
}
```

### 4.4 Tipos de cambio

| Tipo | Entidad | Impacto típico | Uso en `agente` |
|---|---|---|---|
| `company.updated` | `company` | medium | Recalcular obligaciones y foco. |
| `tax_record.created` | `tax_record` | high | Nueva base económica; posible obsolescencia. |
| `tax_record.imported` | `tax_record` | high | Importación por lote. |
| `tax_record.reviewed` | `tax_record` | medium | Cambia la confianza del dato. |
| `tax_record.voided` | `tax_record` | high | Corrige la base; no borra historia. |
| `tax_preparation.created` | `tax_preparation` | medium | Nueva preparación disponible. |
| `tax_calculation.created` | `tax_calculation` | medium | Nuevo cálculo acotado. |
| `case.created` | `case` | medium | Nuevo expediente. |
| `case.submitted_for_review` | `case` | high | Requiere atención humana. |
| `case.reviewed` | `case` | high | Revisión completada o cambios pedidos. |
| `case.closed_internally` | `case` | medium | Cierre interno, no presentación. |
| `report.created` | `report` | low | Nuevo informe disponible. |
| `sync.failed` | `company` | high | Datos posiblemente obsoletos. |

`tax_preparation.stale` puede ser un cambio derivado o calcularse al leer
`GET /tax-preparations` con `data_changed_since_preparation`. No es obligatorio
persistirlo como evento si el cálculo es barato y determinista.

### 4.5 Fuente del feed

La tabla de auditoría de gestoría ya registra las acciones relevantes. El feed
puede construirse sobre ella, con estas condiciones:

- no devolver el cuerpo completo del objeto,
- resumir y limitar los `refs`,
- excluir datos personales innecesarios,
- mantener un cursor estable aunque se añadan cambios,
- definir retención (recomendado: 90 días; justificar cualquier valor menor),
- no mezclar empresas.

No hace falta introducir un bus de eventos nuevo en gestoría para la primera
versión. Un endpoint de lectura sobre auditoría es suficiente.

## 5. Read models para vistas

`agente` no pide “pinta un dashboard”. Pide datos de dominio y decide el layout.

### 5.1 Endpoints existentes que se conservan

| Endpoint | Uso |
|---|---|
| `GET /api/companies/{id}/dashboard?year=YYYY` | KPIs, meses, alertas, cálculos. |
| `GET /api/companies/{id}/tax-records` | Registros económicos. |
| `GET /api/companies/{id}/tax-preparations` | Preparaciones y obsolescencia. |
| `GET /api/companies/{id}/tax-calculations` | Cálculos y obsolescencia. |
| `GET /api/companies/{id}/cases` | Expedientes y estado de revisión. |
| `GET /api/companies/{id}/reports` | Informes guardados. |
| `GET /api/status` | Versión, actor, límites de presentación. |
| `GET /api/tax-capabilities` | Alcance real de modelos y cálculos. |

### 5.2 Adiciones recomendadas

- `meta` aditivo en las respuestas de lectura:
  - `generated_at`,
  - `source_updated_at`,
  - `data_fingerprint`,
  - `freshness`: `live | recent | stale | unknown`,
  - `warnings`,
  - `provenance`.
- `source` y `source_updated_at` en registros normalizados.
- `sync_status` por empresa: `ok | partial | failed | unknown`.
- Métodos tipados en el SDK para `taxRecords`, `taxPreparations` y `changes`.
  Hoy varias herramientas usan `client.request(...)` directo.

No se debe romper el formato actual. Los campos nuevos son aditivos y opcionales
para clientes antiguos.

### 5.3 Envelope de vista

`agente` envolverá el read model en su propio `ViewEnvelope`. Gestoría no debe
devolver `RuntimeViewSpec` ni componentes.

```json
{
  "data": { "metrics": {}, "alerts": [] },
  "meta": {
    "company_id": "a1b2c3d4e5f60718293a4b5c6d7e8f90",
    "generated_at": "2026-11-10T09:12:00Z",
    "source_updated_at": "2026-11-10T09:10:00Z",
    "data_fingerprint": "sha256:...",
    "freshness": "recent",
    "warnings": ["3 registros pendientes de revisión"],
    "provenance": [
      { "source": "odoo", "ref": "account.move:1234" }
    ]
  }
}
```

La UI de `agente` decide si eso se pinta como dashboard, tabla o detalle.

## 6. Acciones y revisión

### 6.1 Acciones que `agente` puede proponer

- crear borrador de expediente,
- crear registro económico,
- importar registros,
- calcular 303/130 dentro del ámbito,
- generar informe,
- enviar a revisión.

### 6.2 Acciones que requieren humano

- revisar un registro,
- aprobar o pedir cambios en un expediente,
- cerrar un expediente revisado,
- cualquier operación marcada como `review` o `approval`.

### 6.3 Acciones que no existen

- presentar una declaración,
- pagar un impuesto,
- emitir una factura fiscal,
- firmar o certificar,
- aprobar en nombre de un humano.

Si una capacidad no existe, el contrato debe devolver un error explícito. No se
crea un stub que finja éxito.

## 7. Errores, idempotencia y resultado desconocido

### 7.1 Errores

| Situación | Respuesta | Efecto en `agente` |
|---|---|---|
| Validación | 400/422 | Rechazo definitivo; corregir. |
| Sin credencial | 401 | No reintentar; renovar token. |
| Rol insuficiente | 403 | No reintentar; escalar a humano. |
| Otra empresa | 404 | No revelar existencia. |
| Conflicto de revisión o duplicado | 409 | Releer y reconciliar. |
| Fallo del proveedor | 5xx/408/429 | `outcomeUnknown`; no reintentar a ciegas. |

### 7.2 Idempotencia

- `tax_record.external_id` sigue siendo único por empresa.
- Un duplicado devuelve 409 y no crea una segunda fila.
- Las escrituras que `agente` reintente deben llevar una clave de idempotencia
  estable (`request_id` o `external_id`).
- Una sincronización Odoo debe registrar `sync_run_id` y no volver a aplicar el
  mismo cambio.

### 7.3 Resultado desconocido

Si Odoo o gestoría no confirman una escritura, `agente` debe mostrar
“resultado desconocido” y reconciliar antes de ofrecer otro intento. No se
convierte un timeout en éxito ni se duplica una acción.

## 8. Salud, versión y compatibilidad

`GET /api/status` debe incluir, de forma aditiva:

```json
{
  "version": "0.1.0",
  "contract_version": "2026-11-10",
  "external_submissions": false,
  "invoice_issuance": false,
  "official_filing": false,
  "sync_status": "ok"
}
```

Reglas:

- `contract_version` cambia solo con modificaciones incompatibles.
- Campos nuevos: aditivos y opcionales.
- Campos eliminados o renombrados: nueva versión y periodo de convivencia.
- El SDK `@agntia/gestoria` declara la misma versión.
- `probe` de `agente` usa `/api/status`; si falla, el dominio queda
  `unavailable`, no `healthy`.

## 9. Requisitos específicos del adaptador Odoo

El adaptador Odoo vive dentro de gestoría. Debe cumplir:

1. No exponer filas crudas de Odoo a `agente`.
2. Normalizar a `company`, `tax_record`, `document` y `case` con procedencia.
3. No auto-revisar registros importados.
4. No auto-calcular ni auto-presentar.
5. Respetar la regla de corrección: anular y crear referencia nueva.
6. Emitir `sync.failed` si la sincronización no termina.
7. Mantener `external_ref` estable entre ejecuciones.
8. No mezclar empresas ni reutilizar IDs de otra empresa.
9. No convertir un estado de Odoo en aprobación humana.
10. Documentar qué campos de Odoo se mapean y cuáles se ignoran.

## 10. Flujo esperado en `agente`

```text
Odoo
  → adaptador Odoo en gestoría
  → tax_record / company normalizados + auditoría
  → GET /changes
  → BusinessMoment de agente
  → ViewPlanner
  → read model de gestoría
  → ViewEnvelope
  → UI + narración de Laia
```

La conversación aporta intención y foco. El change feed aporta el momento real.
La vista se materializa solo si hay datos, permisos y una razón para mostrarla.

## 11. Tests de aceptación

### Contrato y auth

- [ ] `GET /api/status` devuelve `contract_version`, `official_filing: false` y `sync_status`.
- [ ] Un token `agent` no puede revisar un expediente ni un registro.
- [ ] Un token de otra empresa recibe 404, no 403 con detalles.
- [ ] `agente` no usa `GESTORIA_OWNER_TOKEN` para llamadas de agente.
- [ ] El SDK tipa `companies`, `taxRecords`, `taxPreparations`, `cases`, `dashboard` y `changes`.

### Change feed

- [ ] Crear un registro produce un `tax_record.created` y un cursor nuevo.
- [ ] Reintentar con el mismo cursor no duplica cambios.
- [ ] El feed no devuelve cuerpos completos ni datos de otra empresa.
- [ ] Una importación por lote produce cambios por registro o un cambio de lote explícito.
- [ ] `sync.failed` aparece cuando Odoo no responde.

### Obsolescencia

- [ ] Crear una preparación y luego un registro marca `data_changed_since_preparation: true`.
- [ ] Anular un registro revisado conserva el original y crea historia.
- [ ] Un cálculo previo queda marcado como basado en datos anteriores.
- [ ] La UI puede distinguir `fresh`, `recent`, `stale` y `unknown`.

### Límites

- [ ] No existe endpoint de presentación oficial.
- [ ] Un agente no puede cerrar una revisión por sí solo.
- [ ] Un error 5xx no se convierte en éxito.
- [ ] Un duplicado de `external_id` devuelve 409 y no crea otra fila.

## 12. Orden de implementación

1. Añadir `contract_version`, `sync_status` y metadatos aditivos a `/api/status`.
2. Añadir `source`, `source_updated_at` y `content_hash` a registros normalizados.
3. Implementar `GET /companies/{id}/changes` sobre auditoría.
4. Tipar `taxRecords`, `taxPreparations` y `changes` en `@agntia/gestoria`.
5. Implementar el adaptador Odoo con procedencia e idempotencia.
6. Implementar en `agente` el `BusinessMoment`, el `ViewPlanner` y el `ViewMaterializer`.
7. Añadir las primeras vistas: dashboard, registros y expediente.
8. Retirar el resolver de regex y el `view.resolved` vacío de `agente`.

## 13. Anti-patrones

- Enviar a `agente` todas las filas de Odoo “por si acaso”.
- Generar HTML o React dentro de gestoría.
- Exponer `RuntimeViewSpec` desde el dominio.
- Usar el token owner para agentes.
- Dejar que un LLM revise o cierre.
- Presentar datos obsoletos sin aviso.
- Convertir un timeout en éxito.
- Crear un endpoint de presentación oficial sin motor legal validado.
- Duplicar la lógica fiscal en `agente`.

## 14. Definición de “listo para integrar”

Una empresa está lista para la primera integración cuando:

- tiene `company_id` estable,
- al menos un registro económico con procedencia,
- un change feed que devuelve cambios sin duplicados,
- un dashboard con `generated_at` y frescura,
- un expediente con revisión humana,
- y un test que demuestra que un agente no puede aprobar.

Eso es suficiente para que `agente` pinte una vista real y Laia la narre sin
inventar nada.
