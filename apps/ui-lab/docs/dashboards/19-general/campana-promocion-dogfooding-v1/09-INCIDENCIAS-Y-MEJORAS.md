# Incidencias y mejoras

## Bloqueantes encontrados y resueltos

1. **`apps/site` no coincidía con la landing viva.** Un deploy desde `main` habría
   publicado una página antigua. Se restauró el snapshot vivo antes de disparar el
   pipeline.
2. **Login V3 no autenticaba.** Era una maqueta con avisos. Se conectó a `useAuth`,
   OAuth real y demo sin crear un sistema paralelo.
3. **Legal V1 no tenía texto.** Se recuperaron los seis documentos publicados; no se
   inventó contenido ni se presentó un borrador como oficial.

## Bloqueo externo al código

- **Cuota diaria de Vercel agotada.** El job `vercel` autenticó y subió 15,5 KB, pero la
  API respondió `api-deployments-free-per-day` (>100 deployments/día). La landing sigue
  intacta, pero el banner y los redirects legales del ápice no se publicaron. Reintentar
  cuando se restablezca la cuota; no hay cambio de código pendiente.

## No bloqueantes / deuda

- **Solo dos superficies promovidas.** Chat transversal, Centro de Mando editorial,
  chat principal y Launcher siguen en UI Lab. Necesitan cableado de `useChat`,
  `CompanyOverview`, `useWorkspaces` y permisos; no se declaran integradas.
- **OAuth y contraseña sin prueba end-to-end.** Requieren una cuenta autorizada; no se
  solicitan credenciales por chat.
- **Dos implementaciones del banner.** React en el panel y vanilla en la landing
  estática. Comparten clave, esquema y comportamiento; conviene unificarlas cuando la
  landing se reconstruya desde su fuente.
- **Redirects cross-domain.** Las URLs legales antiguas pasan por Vercel hacia
  `www.agntiapro.com/legal#…`; dependen de que el panel esté desplegado.
- **SHA desplegado desconocido.** Sin `FLY_API_TOKEN` no se pudo leer la release previa;
  el rollback usa `flyctl releases`.
- **`favicon.ico` devuelve 404.** Cosmético, no rompe la carga.
- **Banner sobre la tarjeta de login a 1024×768.** Es fijo, no desplaza contenido, pero
  tapa la zona baja de la tarjeta mientras está visible. Se puede mover a ancho completo
  en una próxima iteración.
- **Chunk JS >500 kB.** Aviso de Vite; no bloquea, pero conviene dividir el bundle.
- **Chat público e invitaciones** siguen sin servicio: la UI lo dice y no simula envíos.
- **Legal**: aprobación visual no equivale a aprobación jurídica; los textos son los
  publicados el 21-nov-2026.

## Mejoras siguientes

1. Portar `chat-ux-v2` al `ChatPanel` real sin perder threads, adjuntos ni aprobaciones.
2. Conectar `ChatTransversalV3` al mismo `useChat` y a los permisos audiovisuales.
3. Promover `CommandCenterEditorial` con `getCompanyOverview` real.
4. Mapear los 35 ids del launcher a workspaces y permisos.
5. Unificar el consentimiento y reconstruir la landing desde su fuente real.
