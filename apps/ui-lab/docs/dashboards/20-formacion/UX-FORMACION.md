# UX de Formación

## Modelo visual
Interfaz con lógica de biblioteca musical: portada de colección, carruseles de reels, continuar donde lo dejaste, colecciones temáticas, buscador, reproductor vertical, ficha del ejercicio y progreso. **Branding AgntiaPro** derivado de la landing real, no colores/iconografía Spotify por defecto. Diseño calmado, móvil primero y escritorio responsive; accesibilidad teclado, lector de pantalla y subtítulos.

## Pantallas
1. Inicio Formación: hero «Deja de aprender la IA y empieza a trabajar con LAIA», continuar, recomendaciones, 5 colecciones de 10 y colección de introducción profesional.
2. Colección: portada, descripción, 10 ejercicios, dificultad, conectores necesarios y progreso.
3. Reproductor: vídeo vertical, subtítulos, caption, fuentes/limitaciones, CTA y siguiente reel.
4. Modal de conexión: proveedor, cuenta personal/empresa, permisos legibles, redirección OAuth segura y revocación.
5. Práctica guiada: solicitud editable a LAIA, propuesta de SOP, vista previa de efectos, aprobación, estado, recibo y recuperación de fallos.
6. Biblioteca de conexiones: conectadas, pendientes, caducadas, revocadas; no revelar tokens.

## Estados por ejercicio
unseen → watched → connection_ready → attempted → completed; blocked / failed / skipped como estados alternativos. **watched != completed**. Un ejercicio sin conector requerido puede ir de watched a attempted. La revocación no borra aprendizaje, pero bloquea nuevas acciones.

## CTA
- No conectado: «Conectar [app]»; explicar por qué y qué permisos.
- Ya conectado: «Pruébalo con LAIA».
- No soportado: «Ver demostración» y «Disponible próximamente», nunca fingir ejecución.
- Acción peligrosa: «Revisar y aprobar».
- Sin permisos: «Solicitar acceso» o «Usar cuenta personal» según políticas.

## Métricas
Reproducción, finalización visual, intento, ejecución verificada, tiempo hasta primer valor, reutilización de conexiones, tasa de revocación y abandono de OAuth. No contabilizar conexión como aprendizaje completado.
