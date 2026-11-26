# Ficha · agntia-formacion

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-formacion` |
| Visibilidad | Público |
| Proyecto | Vertical Formación |
| Superficies Agntia Code | Academia, Bitácora |
| Estado | DOCS_ONLY |
| Verificado contra | `main@9c0b7ede0011245edf4ee41f54e38413136fca3d`, 2026-11-26 |
| Lenguaje | sin código de producto |
| Tamaño | 265 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Formación corporativa y academias: diseñar, impartir y evaluar programas con objetivos, evidencias, accesibilidad y resultados verificables, sin inflar asistencia, notas ni certificaciones.

## Qué declara que funciona hoy

- **DOCUMENTATION_ONLY**: sin aplicación, SDK, proveedores conectados ni tests de producto.
- Las 42 campañas están `NOT_STARTED`; sus pruebas, `NOT_EXECUTED`.
- Documentación de producto, investigación, referentes, adaptadores, seguridad, UX, servicio y costes, más matriz de campañas.

## Qué no está verificado

- No existe código ejecutable ni pipeline.
- La calidad se declara "aspiracional, inspirada en referentes"; el repo pide no leerla como resultado.

## Stack y ejecución

- Repo documental; sin `package.json`, `pyproject.toml`, CI ni comandos.
- Variables de entorno: ninguna.

## Datos e integraciones

Solo diseño: LMS, videoconferencia y certificación aparecen como candidatos, sin integración. Sin persistencia.

## Calidad

- Documentación estructurada y coherente con los otros verticales documentales.
- Sin tests, sin licencia, sin descripción en GitHub.
- `handoff_chat_gpt.md` de 30 KB duplicado de otros seis repos.

## Límites y riesgos

- Riesgo de expectativa: un vertical "Formación" sin producto puede confundirse con una academia operativa.
- Certificar competencias es un acto con consecuencias laborales; la ficha mantiene el aviso de no emitir certificados reales.
- Sin código, no hay nada que desplegar.

## Migración a Agntia Code

1. Alta como proyecto "Formación" en modo lectura.
2. Superficies: Academia (currículo y campañas) y Bitácora.
3. Enlazar la matriz de 42 campañas como plan de trabajo, no como producto.
4. Reclasificar cuando exista código con tests fechados.
