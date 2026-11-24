# Estado UX — 09-chat

**24/11/2026 · Campaña ejecutada en `feat/ui-lab-chat-ux-v2` (sin merge ni deploy).**

- Composición aprobada y conservada: saludo, titular, compositor de 680 px, sugerencias, rol, timeline y controles existentes.
- Refinamiento terminado en preview aislada: branding contenido, Manrope local, espaciado, controles de 40 px, lectura con markdown, foco visible y motion contenido.
- Transición portada → conversación con un único compositor y continuidad espacial medida (413 → 720 px).
- Convivencia con panel transversal resuelta por container queries; verificada a 480/680/900 px sin tocar el panel.
- QA automatizado: **76/76 PASS**; typecheck y build PASS. Inspección visual de capturas realizada.
- Capturas del founder y `main` siguen difiriendo en controles multimedia: no se inventan capacidades.
- Pendiente: aprobación visual del founder, decisión sobre markdown/IME/scroll, y abrir el artifact en un Chromebook real.
- Deuda documentada: `chat.error` sin superficie visual; chip SOP sin handler; adjunto no previsualizado en el mensaje.
