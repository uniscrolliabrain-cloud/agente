# Ficha · agntia-seguros

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-seguros` |
| Visibilidad | Público |
| Proyecto | Vertical Seguros |
| Superficies Agntia Code | Academia, Bitácora |
| Estado | DOCS_ONLY |
| Verificado contra | `main@82ef41a61fa41215c5b3be3cd6e3ec11fd04a8f0`, 2026-11-26 |
| Lenguaje | sin código de producto |
| Tamaño | 405 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Operaciones y asistencia profesional de seguros: organizar riesgos declarados, pólizas, renovaciones y expedientes de siniestro con fuentes y revisión competente, integrando operadores autorizados sin atribuirse su licencia ni su decisión.

## Qué declara que funciona hoy

- **DOCUMENTATION_ONLY**: sin aplicación, SDK, proveedores conectados ni tests de producto ejecutados.
- 42 campañas `NOT_STARTED` y pruebas `NOT_EXECUTED`.
- Vertical propuesta documentada: empresa/póliza sintéticas → alcance y profesional → extracción revisada → necesidades y limitaciones → notice de siniestro con evidencias → preparación → revisión humana → handoff sandbox con ACK; la decisión externa se referencia, no se genera como autoridad local.
- Límite explícito: no contratar ni cancelar pólizas, no cobrar primas, no vincular cobertura, no fijar precio, no aceptar ni pagar siniestros.

## Qué no está verificado

- Todo lo ejecutable: no existe.
- Fuentes primarias y repos por SHA están documentados (`docs/research/sources.json`), con el padre cotejado en `54b8d5407a8576459448c4d059a877297d18ca7a`; no se ha revalidado ese cotejo.

## Stack y ejecución

- Repo documental: 8 documentos base, `docs/campaigns/`, `docs/release/` y `docs/research/`.
- Sin `package.json` ni comandos de instalación, test o build.
- Variables de entorno: ninguna.

## Datos e integraciones

Solo diseño: contratos, matriz de proveedores, runbook y plan de aceptación. Sin persistencia ni conectores.

## Calidad

- Documentación de calidad alta y muy explícita sobre límites regulatorios.
- `document-validation.json` valida documentos, no producto (lo dice el propio repo).
- Sin tests, sin CI, sin licencia.

## Límites y riesgos

- Riesgo regulatorio: cualquier demo que parezca decidir sobre coberturas es peligrosa; la ficha conserva el aviso.
- Sin código, su valor en Agntia Code es documental y de aprendizaje, no operativo.
- Mismo `handoff_chat_gpt.md` de 30 KB que otros verticales.

## Migración a Agntia Code

1. Alta como proyecto "Seguros" en modo lectura, sin despliegue.
2. Superficies: Academia (material de formación) y Bitácora (decisiones y límites).
3. Enlazar la matriz de proveedores y el runbook como documentación del proyecto.
4. Reclasificar a `SCAFFOLD` solo cuando exista código ejecutable con tests fechados.
