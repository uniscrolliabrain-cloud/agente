# 11 · Especificación de interacción, motion y hoja deslizable

**Estado:** blueprint para código, no evidencia de que el componente se haya recuperado. La captura del founder muestra un sheet real de videollamada; un agente identificó `apps/web/src/components/MobileChatSheet.tsx` y `MobileChatSheet.css`, pero la lectura de esos paths en `main` devolvió 404 en esta conversación. Buscar el commit/branch correcto antes de clonar. No tocar chat de producción.

## 1. Anatomía y capas
1. Shell y navegación de AgntiaPro (externos a Formación).
2. Escena audiovisual con portada, overlay y controles.
3. Sheet reutilizable con handle de arrastre, cabecera, tabs y scroll interior.
4. Mini-player persistente solo si hay medio real; si no, estado demo/preview sin reproducción ficticia.
5. FAB transversal del chat: evitar taparlo o interceptarlo; especificar stacking y safe area en render real.

## 2. Modelo de estado
`closed → peek → half → full` con transiciones reversibles. `peek`: muestra nombre, progreso/contexto y acción. `half`: metadatos, tabs y primeras filas. `full`: catálogo/recursos/transcripción y scroll. No asumir que tres alturas fijas sirven a todos los dispositivos; calcular con `visualViewport` o unidades dvh con fallback, safe area y teclado.

**Eventos:** click handle, drag handle, flick up/down, escape, tap backdrop si modal, cambio tab, abrir episodio, cerrar, resize, cambio orientación, teclado. **Invariantes:** no perder episodio activo, posición de lectura ni foco; no arrastrar al hacer scroll dentro del listado; no bloquear back/close; no interferir con el chat.

## 3. Reutilización del componente existente
- Recuperar la versión exacta de `MobileChatSheet` de rama/commit y comparar con chat activo; inspeccionar snap points, pointer/touch events, listeners, cleanup, CSS, safe areas, focus trap, scroll locking, z-index y responsive.
- Extraer únicamente el motor `AdaptiveBottomSheet` (layout/gesture), dejando `MobileChatSheet` como composición del chat y `FormationSheet` como composición de cursos.
- Si el original no se recupera, implementar en UI Lab un componente aislado con pruebas, **sin reescribir el chat**. Documentar que es reconstrucción, no clon.
- No importar código de producción a UI Lab con dependencias a auth, API o contexto global no disponible; crear adapter presentacional.

## 4. Motion storyboard (objetivos de diseño, no mediciones)
| Escena | Causa/efecto | Duración de prototipo |
|---|---|---|
| Entrar Formación | título y portada se asientan, controles aparecen después | 500–650ms, stagger 50–80ms entre grupos |
| Abrir curso | portada permanece como ancla; detalle emerge | 260–350ms |
| Arrastrar sheet | posición sigue dedo; al soltar snap con resorte amortiguado | interacción directa, settle 220–350ms |
| Cambiar tab | indicador se desplaza; contenido cambia sin salto de altura | 180–260ms |
| Cambiar episodio | se conserva marco del player; cambia arte/texto y estado | 200–320ms |
| Minimizar player | continuidad espacial a barra inferior sin reset de media | 260–350ms |
| Cerrar sheet | salida breve y retorno de foco al trigger | 200–260ms |

La guía legacy propone instantáneo 80ms, rápido 140ms, estándar 200ms, panel 260ms, espacial 320ms, reveal 500–650ms; son **referencias**, no CSS existente. Priorizar `transform`/`opacity`. Reduced-motion elimina desplazamientos y cascadas, mantiene estado legible.

## 5. Gesto: aceptación funcional
- Pointerdown solo en handle/área de drag; capturar puntero y liberar en cancel/unmount.
- Distinguir tap de drag mediante umbral; velocidad puede influir snap sin saltarse dos niveles accidentalmente.
- Arrastre con límites y resistencia, sin jitter ni overscroll del body.
- Scroll de episodios independiente; cuando está en top, el gesto de arrastre debe ser deliberado, no secuestrar scroll.
- Control equivalente con teclado/botones, `aria-label` y foco visible; Escape cierra cuando proceda.
- Si hay vídeo reproduciéndose, snap no debe reiniciar media; si no existe vídeo, no fingir progreso.

## 6. QA
Grabar secuencia peek→half→full→half→peek, scroll en full, cambiar tab, abrir episodio, orientación, teclado abierto, cierre y reentrada. Medir saltos, latencia perceptual, superposición con chat FAB y nav; comprobar 320/360/390/768/1024/1440, teclado y reduced motion. Sin evidencia grabada = gate pendiente.
