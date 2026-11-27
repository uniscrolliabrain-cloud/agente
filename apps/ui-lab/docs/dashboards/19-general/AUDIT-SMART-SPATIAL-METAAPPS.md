# Paridad UX validada por el founder — Tu Empresa y Agntia Code
2026-11-27. Sustituye el alcance anterior: exclusivamente interacciones aprobadas en la app base UI Lab. No roadmap experimental.
## Inventario vinculante
| Interacción aprobada | Referencia real |
|---|---|
| Dock superior móvil / izquierdo PC, deslizable, accesos fijados separados | apps/web/src/components/DockRail.tsx: 169–235, 250–398, 399–489 |
| Doble pulsación para fijar acceso rápido (experiencia founder) | DockRail onPick 399–419 actualmente alterna pin en click; SidebarV2 627–630 y 672 contienen onDoubleClick. Reproducir gesto observado, contrastar discrepancia en navegador antes de modificar. |
| Tirador de Chats que sube y conserva altura | SidebarV2.tsx 392–453, 689–730: persistencia, límites, teclado, separador |
| Fijar, renombrar, enviar a humano/agente y proyecto mediante popup | SidebarThreads.tsx 278–290, 398–490. Enviar es asignación assignedTo/assignedKind, no permiso de compartición real. |
| Reordenar menú y chats, arrastre con hueco y ghost | SidebarV2.tsx 253–362; SidebarThreads.tsx 129–230; DockRail.tsx 250–398 |
| Extraer chat o entrada de menú y dividir pantalla | SidebarV2.tsx 270–294, 720–724; SidebarThreads.tsx 141–202; apps/web/src/App.tsx 250–258, 289–319, 469–495 |
## Aplicación
Reutilizar componentes, estilos y constantes reales; parametrizar catálogo, orientación, callbacks y claves de persistencia. No inventar nuevas animaciones ni cambiar branding. Conservar 18 superficies de cada meta-app y 72 assets de Company. Adaptar conversaciones y miembros sintéticos; no llamar API real ni conceder permisos. Mantener estado por conversación/versión/repo. Split con ratio 20–80%, orientación móvil vertical y escritorio lateral, cierre y alternativa teclado.
## Orden
1. Localizar CSS exacto del dock, tirador, popup, ghost, drop y separador; registrar baseline visual y gestual de base.
2. Dock y orden de menú para ambas meta-apps, con persistencia independiente.
3. Tirador Chats y popup idéntico; fijar, renombrar, asignar, reordenar.
4. Drop de chats y menú al split; conservar contexto y separador.
5. Comparar en navegador las tres apps, ratón/touch, 390/768/1440, recarga, cancelación, foco y ausencia de regresiones.
## Límites
Founder declara validada la experiencia base; auditoría estática confirma los mecanismos citados, no reproduce todavía navegador. Excluidos predicción, navegación infinita, ventanas flotantes, nuevos atajos, temas, motion nuevo y backend. No tocar app base salvo autorización. No despliegue. No se ha implementado nada en este turno.
