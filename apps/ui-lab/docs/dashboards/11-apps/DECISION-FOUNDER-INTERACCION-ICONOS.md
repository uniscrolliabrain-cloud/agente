# Decisión founder — iconos y launcher

Dirección artística aprobada por founder: renders individuales cerámica marfil, violeta, oro, fondo lavanda suave, como las cinco muestras Correo, Rentabilidad, Conocimiento, Conversaciones y Agenda. Generar 35 imágenes independientes mediante workflow GPT imagen existente en GitHub, con prompts detallados de generacion-v3.json adaptados a esta dirección. Inspeccionar workflow e inputs reales antes de lanzar; guardar resultados por ID en iconos/final/. No usar mosaicos ni SVG tipográficos como acabado. Founder valida estética, agente solo verifica integridad técnica.

## Interacción obligatoria
- Sin nombres visibles permanentemente en escritorio ni cajón.
- Ratón: hover revela nombre, clic abre. Teclado: focus revela nombre, Enter/Espacio abre; aria-label siempre presente.
- Táctil (móvil y tablet): primer toque selecciona y revela nombre; segundo toque sobre mismo icono abre. Tocar otro selecciona ese otro; tocar fuera o Escape cancela. Detectar modalidad real de puntero, no solo ancho. No depender de hover emulado. Mantener área táctil >=44px y selección perceptible.
- Transiciones discretas, reduced motion, sin desplazamiento de cuadrícula al revelar nombre. Buscador conserva accesibilidad y permite localizar por nombre.

Esta decisión prevalece sobre prototipo y campaña anteriores. No desplegar ni modificar producción.
