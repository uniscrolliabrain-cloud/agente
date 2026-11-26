# Auditoría de GitHub para Agntia Code

Fecha de la auditoría: 2026-11-26. Cuenta auditada: `uniscrolliabrain-cloud` (personal, plan free, 2FA activa, sin organizaciones).
Método: API de GitHub mediante la integración conectada (listado autenticado, contenidos y árboles), más comprobación de README y estructura de cada repositorio. No se ha clonado ningún repositorio ni se ha ejecutado su código.

## 1. Resultado principal

- **Hay 17 repositorios, no 18**: 15 públicos y 2 privados. La suma de tamaños (141 252 KB) coincide exactamente con `disk_usage` del perfil, así que no falta ninguno por paginación ni por permisos.
- **No existe ninguna ficha de repositorio en GitHub.** Se buscaron archivos con `ficha`, `FICHA`, `copilot` y variantes en los 15 repos públicos (árbol completo) y en la raíz de los 2 privados: cero resultados. No hay tampoco un repositorio dedicado a fichas ni issues con ese contenido.
- Lo que sí existe en cada repo es un `README.md` largo y, en los verticales, `docs/` con producto, arquitectura, campañas y auditorías, además de `AGENTS.md`. Es documentación de proyecto, **no una ficha normalizada**.
- Los metadatos de GitHub están sin rellenar: **0 descripciones, 0 topics** en los 17 repos; solo `agente` tiene homepage. 14 de 17 no tienen licencia declarada.

## 2. Inventario

Datos de la API el 2026-11-26. Tamaño en KB según GitHub. Estado tomado del propio README de cada repo (entre comillas cuando es literal).

| Repositorio | Vis. | Lenguaje | KB | Último push | Issues | Licencia | Estado declarado |
|---|---|---|---|---|---|---|---|
| `agente` | público | TypeScript | 130 778 | 2026-11-26 | 11 | MIT | Plataforma en desarrollo activo (`0.2.0-beta.1`), monorepo TS/Python, 4 094 archivos |
| `agntiapro-acme` | público | — | 76 | 2026-11-20 | 0 | — | Diseño y documentación; productor de datos sintéticos ACME |
| `agntia-ventas` | público | TypeScript | 515 | 2026-11-23 | 0 | — | `DOCUMENTATION_ONLY` en `main`; scaffolding C01–C06 en rama de fábrica |
| `agntia-iadev` | público | Python | 1 458 | 2026-11-20 | 0 | — | Knowledge engine; `README.md` de 14 bytes; sin estado legible |
| `agntia-branding` | público | TypeScript | 808 | 2026-11-23 | 0 | — | Implementación en curso; 131 tests en verde; Supabase/Penpot/UI sin verificar |
| `agntia-finanzas` | público | TypeScript | 365 | 2026-11-16 | 0 | — | Documentación + scaffolding C01–C05; 41 tests; sin persistencia ni UI |
| `agntia-redes` | público | TypeScript | 776 | 2026-11-23 | 0 | — | Documentación + instalador ensayado sobre un clon; sin proveedor real |
| `agntia-marketing` | público | TypeScript | 1 124 | 2026-11-23 | 0 | — | `IMPLEMENTADO EN main`; 42 campañas (23 DONE / 15 PARTIAL / 4 BLOCKED); 169 tests; Postgres real |
| `agntia-legal` | público | TypeScript | 438 | 2026-11-16 | 0 | — | Documentación + implementación local; 221 tests; 16 IMPLEMENTED / 24 PARTIAL / 2 STUBBED |
| `agntia-seguros` | público | TypeScript | 405 | 2026-11-16 | 0 | — | `DOCUMENTATION_ONLY`; 42 campañas `NOT_STARTED` |
| `agntia-clientes` | público | TypeScript | 1 040 | 2026-11-23 | 0 | — | `SKELETON_IMPLEMENTED`; 114 tests, 9 E2E; sin proveedores ni despliegue |
| `agntia-ciberseguridad` | público | Python | 1 613 | 2026-11-23 | 0 | — | Python/FastAPI + SDK TS; 196 tests + 115 de laboratorio; `production_enabled=false`; 2 PASS / 40 PARTIAL |
| `agntia-formacion` | público | — | 265 | 2026-11-16 | 0 | — | `DOCUMENTATION_ONLY`; `NOT_STARTED` |
| `agntia-gestoria` | público | Python | 933 | 2026-11-22 | 1 | MIT | Producto real para autónomos y SL: web, API, motores 303/130, PDF/SVG |
| `agntia-video` | público | Python | 333 | 2026-11-16 | 0 | MIT | MVP 0.4 (podcast en navegador) + paquete `@agntia/video` |
| `agntia-comunicacion` | **privado** | — | 166 | 2026-11-16 | 0 | — | `DOCUMENTATION_ONLY / NOT_STARTED`; 3 archivos |
| `agntia-dise-o` | **privado** | — | 159 | 2026-11-16 | 0 | — | `DOCUMENTATION_ONLY / NOT_STARTED`; 3 archivos |

### Agrupación real

1. **Plataforma**: `agente`. Es el runtime de AgntiaPro y también el repo donde vive este demo.
2. **Verticales con código ejecutable**: `agntia-marketing`, `agntia-legal`, `agntia-clientes`, `agntia-branding`, `agntia-ciberseguridad`, `agntia-finanzas`, `agntia-redes`, `agntia-ventas` (scaffolding).
3. **Verticales solo documentales**: `agntia-seguros`, `agntia-formacion`, `agntia-comunicacion`, `agntia-dise-o`.
4. **Productos independientes**: `agntia-gestoria`, `agntia-video`.
5. **Datos y escenarios**: `agntiapro-acme`.
6. **Conocimiento/aprendizaje**: `agntia-iadev`.

## 3. Hallazgos de auditoría

### 3.1 Fichas

- No hay fichas. Los `README.md` hacen de ficha improvisada, pero con extensiones y formatos muy distintos: de 14 bytes (`agntia-iadev`) a 16 KB (`agntia-video`), y con estados nombrados de seis maneras (`DOCUMENTATION_ONLY`, `DOCUMENTATION + IMPLEMENTACION LOCAL`, `SKELETON_IMPLEMENTED`, `IMPLEMENTADO EN main`, `IMPLEMENTACIÓN EN CURSO`, `MVP 0.4`).
- **Vocabulario de estado no comparable.** Sin un campo normalizado no se puede ordenar la cartera ni decidir qué migrar primero.
- **Handoff duplicado**: siete repos comparten un `handoff_chat_gpt.md` de 30 KB con el mismo blob (`cc6c8697…`): ventas, finanzas, redes, marketing, legal, seguros y formación. Otros dos usan otra copia (`371b34b9…`). No aporta información por repo y confunde la lectura.
- **Volcado enorme**: `agntia-iadev` incluye un markdown de 1,26 MB (`ChatGPT-Auditar aprendizaje en repositorios-20261119-1135.md`). Es el 86 % del peso del repo y no es documentación de producto.
- **Repo privado con nombre poco legible**: `agntia-dise-o` (slug sin `ñ`). Cosmético, pero rompe la convención `agntia-<dominio>`.

### 3.2 Metadatos y gobernanza

- Sin descripciones ni topics en los 17: la búsqueda dentro de GitHub no sirve para distinguirlos.
- Sin licencia en 14 de 17. En una migración a un producto que mostrará código a clientes, la licencia es un campo de ficha obligatorio.
- Solo `agente` declara homepage. Ninguno declara entorno de producción en metadatos.
- 12 issues abiertas en total (11 en `agente`, 1 en `agntia-gestoria`); el resto de repos no usa issues.
- No hay organización: todo cuelga de una cuenta personal. Para un workspace de Agntia Code con varios `builder` conviene una organización, aunque no es bloqueante.

### 3.3 Riesgos declarados por los propios repos

- Varios README admiten que **las 42 campañas siguen abiertas** y que Supabase, proveedores y despliegue no están verificados. Eso es bueno: la ficha debe conservar esas etiquetas y no convertirlas en "terminado".
- `agntia-ciberseguridad` mantiene `production_enabled=false` y correcciones de cronología en el propio README. Cualquier ficha debe fecharse contra un commit, no contra el texto.
- `agente` mezcla el producto con el laboratorio de UI y el demo; su ficha necesita separar "producto", "laboratorio" y "datos sintéticos".

## 4. Mapa propuesto repo → proyecto y workspaces de Agntia Code

Los 18 workspaces son superficies de producto, no repositorios. La migración correcta es **un proyecto por repo** y, en cada ficha, declarar qué superficies usa.

| Repo | Proyecto en Agntia Code | Superficies principales |
|---|---|---|
| `agente` | AgntiaPro (plataforma) | Estudio de código, Editor, Despliegues, Entornos |
| `agntiapro-acme` | ACME sintético | Datos, Pruebas, Bitácora |
| `agntia-ventas` | Vertical Ventas | Repositorios, Ramas, Revisiones |
| `agntia-branding` | Vertical Branding | Repositorios, Revisiones, Bitácora |
| `agntia-finanzas` | Vertical Finanzas | Datos, Pruebas, Despliegues |
| `agntia-redes` | Vertical Redes | Ramas, Despliegues, Observabilidad |
| `agntia-marketing` | Vertical Marketing | Despliegues, Datos, Observabilidad |
| `agntia-legal` | Vertical Legal | Revisiones, Entornos, Bitácora |
| `agntia-seguros` | Vertical Seguros | Academia, Bitácora |
| `agntia-clientes` | Vertical Clientes | Ramas, Pruebas, Observabilidad |
| `agntia-ciberseguridad` | Ciberseguridad | Revisiones, Entornos, Observabilidad |
| `agntia-formacion` | Vertical Formación | Academia, Bitácora |
| `agntia-comunicacion` | Vertical Comunicación | Academia, Bitácora |
| `agntia-dise-o` | Vertical Diseño | Editor, Bitácora |
| `agntia-gestoria` | Gestoría | Datos, Infraestructura, Despliegues |
| `agntia-video` | Video | Terminal, Infraestructura, Despliegues |
| `agntia-iadev` | IA Dev / Knowledge | Academia, Datos, Observabilidad |

Queda un workspace sin repo propio: **Chats de construcción**. Es correcto: es una superficie transversal que se usará con todos los proyectos, no un repositorio.

## 5. Ficha canónica propuesta

Una ficha por repo, en `docs/FICHA.md` dentro del propio repo (fuente de verdad junto al código) y sincronizada en Agntia Code. Formato:

```markdown
# Ficha · <repo>

## Identidad
- repo: <owner>/<repo> · visibilidad: público | privado
- propósito: <una frase>
- propietario: <persona> · equipo: <vertical>

## Estado
- estado: DOCS_ONLY | SCAFFOLD | IMPLEMENTATION | PRODUCT_LOCAL | DEPLOYED
- verificado contra: <commit> · fecha: <YYYY-MM-DD>
- qué funciona hoy: <3-5 hechos comprobables>
- qué no está verificado: <lista explícita>

## Stack y ejecución
- lenguaje/runtime: <...> · gestor: <...>
- comandos: install / dev / test / build
- entrypoints: <rutas>
- datos: <D1 | Postgres | SQLite | ninguno> · migraciones: <ruta>

## Integraciones
- proveedores: <...>
- variables de entorno (solo nombres): <...>
- despliegue: <Vercel | Cloudflare | local | ninguno>

## Calidad
- pruebas: <nº y comando> · última ejecución: <fecha/commit>
- CI: <sí/no y workflows>
- licencia: <SPDX>
- riesgos y límites declarados: <...>

## Agntia Code
- proyecto: <nombre>
- superficies: <lista de workspaces>
- rama de trabajo: <...> · entorno de preview: <...>
```

### Vocabulario de estado (normalizado)

- `DOCS_ONLY`: sin código ejecutable de producto.
- `SCAFFOLD`: contratos y esqueleto que compila y pasa tests, sin dominio completo.
- `IMPLEMENTATION`: vertical ejecutable localmente, sin proveedores ni despliegue.
- `PRODUCT_LOCAL`: producto usable en local, sin despliegue gestionado.
- `DEPLOYED`: sirviendo en una URL con checks verdes y evidencia fechada.

Con esto, los 17 repos quedan así: `DOCS_ONLY` 5 (seguros, formación, comunicación, diseño, acme); `SCAFFOLD` 5 (ventas, finanzas, redes, branding, clientes); `IMPLEMENTATION` 3 (marketing, por su Postgres y worker verificados; legal, con 221 tests y 401 por defecto; ciberseguridad, con API y tests pero `production_enabled=false`); `PRODUCT_LOCAL` 2 (`agntia-gestoria`, `agntia-video`); `DEPLOYED` 0; **sin clasificar 1** (`agntia-iadev`, cuyo README tiene 14 bytes y no permite afirmar estado). `agente` se marca aparte como plataforma en desarrollo y no entra en el recuento anterior.

## 6. Plan de migración

1. **Normalizar (1 PR por repo)**: crear `docs/FICHA.md` con la plantilla, rellenar estado y commit de verificación, y borrar el `handoff_chat_gpt.md` duplicado cuando no aporte nada propio.
2. **Importar a Agntia Code**: alta de proyecto por repo, enlace al repositorio, rama por defecto, comandos y superficies. Sin tocar código de los verticales.
3. **Autocompletar desde la API**: lenguaje, tamaño, licencia, último push, issues y workflows; el resto lo firma una persona.
4. **Salud de cartera**: semáforo por repo con cinco comprobaciones (build, tests, licencia, CI, secretos escaneados). Sin conexión, estado "desconocido", nunca verde.
5. **Cierre**: bitácora inicial por proyecto, con la ficha enlazada y la fecha de corte.

### Criterios de aceptación

- Las 17 fichas existen, comparten plantilla y declaran commit de verificación.
- No hay dos estados distintos para el mismo repo en README y ficha.
- El inventario de Agntia Code coincide con GitHub en número, visibilidad y último push.
- Ningún repo se muestra como `DEPLOYED` sin URL y checks verificados.

## 7. Límites de esta auditoría

- La API sin autenticar agotó su cuota al enriquecer árboles y commits: los recuentos de tests y workflows provienen de los README, no de una ejecución.
- No se ha clonado, compilado ni ejecutado ningún repo; no se afirma que sus tests pasen hoy.
- No se ha hecho escaneo de secretos ni revisión de ramas y PRs.
- No se han inspeccionado los 2 privados más allá de su raíz y README, por diseño.
- El repo número 18 que menciona el propietario no está en esta cuenta: puede ser de otra cuenta u organización, o estar aún sin crear.
