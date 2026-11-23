# 01 · Dirección de arte y experiencia

## Idea de producto

**Formación es una biblioteca audiovisual dentro del software empresarial, no una academia ni un dashboard de métricas.** La familiaridad de una app musical se expresa en estanterías, colecciones, continuidad, reproducción y descubrimiento. La personalidad visual viene de AgntiaPro.

Lema: **«Deja de aprender la IA y empieza a trabajar con LAIA»**. Distinguir el track de fundamentos IA del track práctico LAIA; no fingir que los 120 cursos ya están producidos.

## Benchmark visual obligatorio

Inspeccionar **render y CSS activos** de Landing y Studio Demo en el commit de ejecución. Extraer tokens, pesos tipográficos, radios, sombras, alturas, espacios, comportamiento de tarjetas, fotografía/ilustración, densidad, contraste y movimiento. El diseño no se acepta por coincidencia de color: debe igualar el nivel de composición y acabado.

Identidad documental de referencia, verificar contra tokens reales: marfil cálido, blanco limpio, tinta oscura, violeta de acción, acento oro LAIA; Fraunces editorial y Manrope operativa. Evitar: dark mode genérico, verde Spotify, grandes degradados, bordes luminosos, avatares robóticos, mosaicos uniformes, componentes de tutorial corporativo, gamificación invasiva.

## Layout desktop

Dentro del **shell existente**, no crear sidebar global. Encabezado editorial compacto y cálido con intención elegida (Trabajo / Aprender / Explorar). Biblioteca local cuando haya ancho: Inicio, Buscar, Tu biblioteca. Hero destacado con portada narrativa y beneficio; estanterías horizontales de colección; columna secundaria solo cuando añada valor real. Reproductor mini persistente en base del área de Formación sin tapar la navegación ni el chat transversal. Al abrir un curso, detalle y reproductor expandido: vídeo 9:16 con entorno que respira, información editorial y CTA de práctica contextual. No convertir todo en un grid de tarjetas.

## Layout móvil

Una sola columna, portada y carruseles swipeables, controles táctiles de al menos 44 px, reproductor mini accesible, hoja inferior para cola/detalles con gesto claro, retorno al contexto y scroll preservado. No inventar status bar ni segunda navegación global. Respetar safe areas y teclado.

## Estados y recorridos

Inicio sin historial, onboarding opcional, selección de modo, buscar, resultados, filtro, colección, abrir episodio, reproducir/pausar, avanzar, guardar, continuar, cola, ocultar, valorar utilidad, CTA práctica, falta de permiso, contenido no producido, error de vídeo, offline, vacío, loading, acceso revocado. La UI distingue **consumo**, **práctica iniciada** y **práctica verificada**.

## Motion

La coreografía editorial de Landing orienta la entrada; Studio orienta continuidad semántica. Entrada con stagger breve, transiciones de colecciones, mini-player→player expandido, tarjeta→detalle y sheet móvil sin saltos de layout. Preferir transform/opacity, 150–300 ms orientativos, respetar reduced-motion. Ninguna animación impide operar ni introduce CLS apreciable.

## Retención con intención

Trabajo = utilidad inmediata; Aprender = profundidad voluntaria; Explorar = curiosidad. No inferir modo del horario. Permitir sesiones largas elegidas, pausa, guardar y «terminar por hoy» sin presión de rachas.
