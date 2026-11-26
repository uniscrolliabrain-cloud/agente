# Repositorios — funcionamiento

## Flujo principal

1. El usuario abre Repositorios y ve el estado de la conexión: sin conectar, conectada o con incidencias.
2. "Conectar GitHub" explica los permisos y redirige a la instalación de la App.
3. Al volver, se listan organizaciones y repositorios accesibles con un buscador.
4. El usuario habilita un repo, elige rama por defecto y, si es monorepo, la carpeta raíz.
5. Se analiza el stack y se propone configuración de build y test; el usuario confirma.
6. El repo aparece como `sincronizado` y queda disponible para editor, terminal y despliegues.
7. Cualquier revocación se refleja de inmediato y detiene las operaciones que dependían de ella.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `installation` | id, tenantId, provider, accountLogin, permisos[], estado, autorizó |
| `repoLink` | id, projectId, installationId, repoId, ramaPorDefecto, carpetaRaíz, modo (lectura/escritura) |
| `repoSync` | repoLinkId, últimoCommit, últimaLectura, webhookEstado, incidencias[] |
| `stackProfile` | repoLinkId, framework, gestor, buildCmd, testCmd, confianza |

## Estados

Instalación: `pendiente` → `activa` → `revocada` | `expirada`. Repo: `descubierto` → `analizando` → `listo` | `solo-lectura` | `error`. Sincronización: `al-día` → `retrasada` → `incidencia` → `al-día`.

## Roles y permisos

- `viewer`: ve nombres de repos habilitados, no credenciales ni configuración.
- `reviewer`: ve estado y metadatos.
- `builder`: habilita repos y cambia rama por defecto.
- `owner`: instala y revoca la App; único que puede pasar a escritura.

## Errores, reintentos e idempotencia

- Instalación cancelada: se vuelve a `sin conectar` sin dejar registro parcial.
- Webhook perdido: se reconcilia con una lectura completa al abrir el proyecto.
- Repo renombrado o transferido: se detecta por `repoId` y se pide confirmación para reconectar.
- Repetir "habilitar" sobre el mismo repo no duplica el vínculo.

## Rendimiento y límites

- El listado pagina de 50 en 50 y se cachea 60 s.
- El análisis de stack se limita a 2000 archivos y 20 s; si excede, se marca "no concluyente".
- Máximo 100 repos habilitados por workspace en el plan base.
- Los webhooks se procesan con reintentos exponenciales hasta 24 h.

## Móvil y accesibilidad

- Lista de repos en tarjetas con estado textual; sin tablas que requieran scroll horizontal.
- Los pasos de conexión se explican antes de salir a GitHub.
- Al volver de la instalación, el foco regresa al primer repo disponible.
- Los estados usan icono, texto y color.

## Demo actual frente a conectado

El clon muestra dos repositorios con estado "Conectado" y una tabla de ejemplo; no existe instalación, ni llamadas a GitHub, ni webhooks. "Importar" lanza un aviso de simulación.

## Criterios de aceptación

- Sin instalación activa, ninguna superficie intenta escribir en GitHub.
- El modo lectura/escritura se refleja en todos los botones que dependen de él.
- Revocar acceso detiene operaciones en curso y deja constancia en la bitácora.
- El repo habilitado sobrevive a recargas y a la rotación de token de instalación.
