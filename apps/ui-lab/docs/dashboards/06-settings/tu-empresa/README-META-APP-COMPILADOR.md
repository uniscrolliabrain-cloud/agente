# Tu Empresa — Construye la empresa que quieres tener

AgntiaPro te ofrece dos maneras de trabajar: dirigir tu empresa y construir la empresa que quieres tener.

En tu entorno habitual trabajas con tus clientes, tu equipo y tus agentes. Desde Ajustes → Tu Empresa puedes entrar en un estudio completo donde pensar, diseñar y mejorar tu organización.

No necesitas saber redactar un business plan, diseñar un proceso ni aprender inteligencia artificial. Puedes empezar contando cómo funciona tu negocio, qué te preocupa y qué quieres conseguir. LAIA te acompaña, organiza la información contigo y te presenta propuestas que puedes revisar y mejorar.

Tu empresa sigue trabajando mientras preparas su siguiente versión. Tú decides cuándo está lista.

## La navegación que verá el propietario

| Entrada | Qué puedes hacer |
|---|---|
| Tu Empresa | Ver cómo está tomando forma tu empresa y continuar donde lo dejaste. |
| Identidad | Contar quién eres, qué quieres construir y qué valores te representan. |
| Modelo de negocio | Definir cómo aportas valor, a quién ayudas y cómo ganas dinero. |
| Marca | Construir tu identidad visual, tu manera de comunicar y tu presencia. |
| Estrategia | Decidir adónde quieres llegar y qué pasos dar. |
| Organización | Diseñar tu equipo humano y digital, sus responsabilidades y su colaboración. |
| Productos y servicios | Definir qué vendes, a qué precio y cómo lo entregas. |
| Mercado | Conocer a tus clientes, tu competencia y las oportunidades de tu negocio. |
| Finanzas | Comprender tus ingresos, gastos, presupuestos y posibilidades de crecimiento. |
| Relaciones | Organizar tus proveedores, socios, colaboradores y contactos. |
| Operaciones | Mejorar cómo se trabaja cada día en tu empresa. |
| Tecnología | Elegir las herramientas y capacidades que te ayudan a trabajar mejor. |
| Gobierno de tu empresa | Decidir quién puede hacer qué y cómo mantienes el control. |

Herramientas transversales: Fuentes, Entrevistas, Formación, Historial de versiones, Vista previa y Publicar. Accesibles desde el estudio y desde el contexto pertinente, sin convertirlas en dimensiones empresariales adicionales. LAIA permanece disponible durante todo el recorrido.

## Una empresa que sigue creciendo

Puedes empezar hablando, aportando documentos, vídeos, audios, hojas de cálculo o invitando a tu equipo a contar cómo trabaja. La información original se conserva. Las propuestas se construyen a partir de ella, se revisan contigo y se convierten en una nueva versión de tu empresa cuando las apruebas.

En el entorno operativo puedes decir: «LAIA, prepara una propuesta para este cliente». En Tu Empresa puedes decir: «LAIA, quiero mejorar nuestra manera de vender. Habla con mi equipo y ayúdame a diseñar una forma de trabajar mejor».

No es un onboarding que termina al contratar. Es el lugar al que vuelves para seguir construyendo tu empresa. AgntiaPro se ocupa de la complejidad tecnológica; tú puedes centrarte en dirigir, liderar y decidir.

## Voz de marca y reglas de diseño

La landing vigente es la autoridad de voz comercial. Utilizar lenguaje cotidiano, cálido, profesional y preciso. Hablar de resultados, personas y decisiones. Evitar en la interfaz términos como ontología, fixture, runtime, gate, blueprint o ingeniería de procesos cuando una expresión normal comunica lo mismo. No prometer activaciones reales desde una demo. Mantener la distinción entre trabajar en la empresa y construirla. No reducir la meta-app a un workspace ni a un asistente lineal.

Las doce dimensiones son la propuesta de navegación preferente. Las dieciocho fichas técnicas que siguen son un inventario interno de capacidades, no dieciocho entradas obligatorias. Fuentes y entrevistas se agrupan como herramientas de captura; Ingeniería de Procesos se integra en Operaciones; Desarrollo del Talento se distribuye entre Organización y Formación; Versiones y Publicación se sitúan en los controles transversales. La denominación final queda abierta a revisión del founder.

---

# Anexo interno — Especificación de construcción

# Tu Empresa — Meta-app de compilación empresarial
Fecha: 2026-11-26. Propuesta UX para PMV en UI Lab, no autorización de implementación ni activación real.

## 1. Mandato del founder
Ajustes → Tu Empresa transforma la aplicación web completa en un entorno de construcción empresarial. No es workspace 21, modal, wizard ni producto construido desde cero. Reutilizar shell, menús adaptativos, split panes, chat transversal, editores, exploradores, tarjetas, timelines, vistas Kanban y grafo de AgntiaPro; instanciar superficies vacías con taxonomía, títulos, iconos, acciones, permisos y datos propios. Una sección puede recombinar varios módulos. Mantener la app normal intacta. Analogía WordPress: editar borradores, previsualizar, publicar la empresa. No bloquear UX por contratos futuros. Primero demo interactiva, luego auditoría de integración.

## 2. Fuentes y autoridad
Leer íntegramente antes de implementar:
- [Índice Agntia Demo](../../../agntia-demo/README.md)
- [CEO](../../../agntia-demo/01-kick-off/RESPUESTA-CEO-OPERATIVO-VERBATIM.md)
- [Founder](../../../agntia-demo/02-vision-founder/RESPUESTA-FOUNDER-VERBATIM.md)
- [Cuatro instrucciones raw](../../../agntia-demo/03-instrucciones-founder-raw/)
- [18 taxonomías, seis ejes y fixtures](../../../agntia-demo/04-plantilla-derivada/)
- [Blueprint, fases, dataset, owner journey](../../../agntia-demo/03-compilacion-y-dataset/)
- [Guía maestra UX](../../19-general/galeria-branding/GUIA-MAESTRA-BRANDING-UX-V2.md)
- [Registro de previews](../../../../src/registry.tsx)
- SidebarV2 en apps/web/src/components/SidebarV2.tsx y FullAppPreview en apps/ui-lab/src/FullAppPreview.tsx.
Las fuentes raw prevalecen sobre derivados. Este documento propone una IA de navegación, no sustituye fuentes. La landing sigue siendo puerta comercial; actualización tecnológica continua enriquece el servicio. El compilador se usa por owner y colaboradores autorizados; no obliga a aprender tecnología.

## 3. Inventario técnico de superficies (propuesta anterior, no menú visible)
Usar el rail y menú expandible existentes, reordenamiento y split view si están disponibles. Identidad Tu Empresa, indicador permanente Draft / Publicada, selector de revisión y volver a empresa. Nombres de producto propuestos, no IDs de rutas existentes.

| Grupo | Entrada | Icono conceptual | Base UX a reutilizar | Taxonomías |
|---|---|---|---|---|
| Construcción | Estudio de Compilación | Layers | Centro de Mando editorial + Estudio Demo | 01–18 |
| Construcción | Fuentes Originales | Archive | Documentos V9 | 05,13,14,16 |
| Construcción | Entrevistas y Captura | Mic | Comunicación + Chat | 04,10,13,14 |
| Fundamentos | Identidad y Cultura | Fingerprint | Conocimiento V4 + Documentos | 01,05 |
| Fundamentos | Modelo de Negocio | Compass | Conocimiento + Cartera + Data | 02,06,09 |
| Fundamentos | Branding | Palette | Documentos + Apps + editor | 01,05,06 |
| Dirección | Diseño Estratégico | Target | Proyectos/Cartera + Centro de Mando | 08,18 |
| Dirección | Diseño Organizativo | Network | Equipo + grafo | 03,04,10,12 |
| Dirección | Productos y Servicios | Package | Apps + Documentos | 02,07 |
| Dirección | Mercado y Competencia | Telescope | Conocimiento + Data | 06,07,18 |
| Recursos | Diseño Económico | Calculator | Analítica/Data + Documentos | 09,18 |
| Recursos | Ecosistema Empresarial | Handshake | Relaciones/Agenda, fichas y tablas | 04,05,07,09 |
| Construcción operativa | Diseño Operativo | PanelsTopLeft | Estudio Demo, inspector y timeline | 08,11,15,16 |
| Construcción operativa | Ingeniería de Procesos | Workflow | Tareas/Automatizaciones + Estudio | 11,15,16 |
| Construcción operativa | Arquitectura Tecnológica | Cpu | Apps Launcher + fichas | 12,15,17 |
| Construcción operativa | Desarrollo del Talento | GraduationCap | Formación V4 + Equipo | 10,12,18 |
| Control | Gobernanza | ShieldCheck | Ajustes, Legal, aprobaciones | 17,16 |
| Control | Versiones y Publicación | GitBranch | Timeline, comparador, documentos | 16,17,18 |

Chat con LAIA es transversal y conserva identidad; contexto de compilación siempre visible. No crear una entrada genérica Chat que sustituya entrevistas. Los 18 dominios ontológicos no tienen por qué corresponder 1:1 a estas 18 entradas. Orden y nombres sujetos a revisión founder. Los iconos son conceptos para una familia nueva coherente con branding; no copiar iconos operativos indiscriminadamente.

## 4. Fichas funcionales completas del menú
Cada ficha describe una capacidad que debe integrarse en las doce dimensiones o herramientas transversales; no exige una entrada independiente. Cada experiencia debe implementarse como superficie completa, con estado vacío útil, versión poblada, revisión y estado de publicación. No esconder funciones detrás de un wizard. Los ejemplos siguientes son propuestas sintéticas derivadas del kickoff, no registros verificados.

### 01 Estudio de Compilación
Inicio editorial: saludo LAIA, propósito de la empresa en construcción, revisión seleccionada, mapa de dimensiones, decisiones y bloqueos, próxima actividad. Alternar resumen, mapa y timeline de compilación; inspector de procedencia. Acciones: abrir sección, revisar propuesta, crear revisión, previsualizar. Vacío: «Cuéntanos cómo funciona tu negocio», importar fuente o explorar plantilla. Agntia Demo: owner, LAIA y nueve dominios, oferta 1500 EUR implantación y desde 1000 EUR/mes, dos servicios prioritarios por cliente; objetivo diez clientes, escenario ocho. No inventar porcentaje de compilación: calcular desde cobertura declarada. Salida: índice del blueprint y decisiones enlazadas.
### 02 Fuentes Originales
Explorador de archivos con carpetas dueño, empleados, economía, marca, clientes, procedimientos, sistemas, contratos; importar documento, hoja, audio, vídeo, enlaces y exportaciones. Lector, metadatos, transcripción, consentimiento, etiquetas, vincular a entidad, búsqueda, fuente contradictoria. Original inmutable separado de interpretación editable. Vacío: importación y grabación. Demo: kickoff CEO, visión founder, instrucciones raw y plantillas como fuentes documentales; no fingir que existen grabaciones. Salida: catálogo de fuentes y evidencias reutilizables.
### 03 Entrevistas y Captura
Agenda, entrevistas por área/actor, sala de conversación con LAIA por texto, audio y vídeo, preguntas libres y seguimiento; grabar/importar, transcribir, seleccionar fragmento, extraer hechos/propuestas, pedir aclaración, vincular a dimensiones. Vacío: entrevista abierta del owner. Demo: cinco preguntas maestras, owner y especialistas LAIA, Marcos, Antonio, Juan, Ana, Pedro; entrevistas adicionales son fixtures propuestas. Salida: respuestas, transcripciones, consentimiento y cuestiones no resueltas; agentes no hacen cambios externos por conversar.
### 04 Identidad y Cultura
Página editorial editable tipo Notion: historia, propósito, misión, visión, valores, principios, rituales, tono humano y relación owner-equipo. Árbol documental, enlaces a evidencias y panel de propuestas. Demo: profesionalización de pequeñas empresas, tecnología transparente, control humano y evolución continua; redactar misión/visión como borradores, no citas literales. Salida: identidad empresarial, cultura, one-pager enlazado a modelo de negocio.
### 05 Modelo de Negocio
Lienzo editable de propuesta de valor, segmentos, canales, ingresos, costes, socios y actividades; business plan con bloques, anexos y supuestos. Comparar escenarios de precios y márgenes, sin confundirlos con resultados. Demo: autónomos/pymes hasta ocho personas, España inicialmente, 1500 EUR instalación, desde 1000 EUR mensual, dos servicios de alto ROI, acompañamiento continuo; landing y discovery. Salidas: one-pager, business plan y modelo de monetización, vinculados a estrategia y economía.
### 06 Branding
Galería y editor de guía de marca: narrativa, posicionamiento, mensajes, logotipos, tipografías, paleta, voz, dirección fotográfica, iconografía, ejemplos y assets. Importar referencias, generar propuesta local simulada, comparar y validar. Demo: landing como autoridad comercial, Fraunces/Manrope y paleta vigente como referencia de la empresa AgntiaPro, no imponer esa marca a clientes. Distinguir branding del tenant frente al chrome de la meta-app. Salida: branding guide y biblioteca de activos.
### 07 Diseño Estratégico
Cartera de iniciativas, árbol objetivos anuales/trimestrales, métricas, baseline, responsables, calendario, hitos, prioridades, dependencias y escenarios. Editar objetivo, vincular a business plan, comparar hipótesis y aprobar. Demo: objetivo comercial diez clientes, simulación 2+3+3 en 90 días, ocho clientes y 8000 EUR MRR base antes de costes si todos tienen suscripción de 1000 EUR. Las metas trimestrales adicionales deben marcarse propuestas. Salida: plan estratégico y objetivos publicables.
### 08 Diseño Organizativo
Organigrama editable, fichas de actores, matriz de responsabilidades, equipos, turnos, capacidades, dependencias, permisos, supervisores y vacantes. Comparar AS-IS/TO-BE. Demo: owner, LAIA supervisora/interfaz, Marcos operaciones, Antonio finanzas, Juan gestoría, Ana personas, Pedro seguridad, equipo creativo; nueve dominios: dirección, comercial, marketing, operaciones, producto/ingeniería, atención, finanzas/gestoría, personas, seguridad/cumplimiento. Naturaleza humano/agente/proveedor explícita; no inventar contrataciones reales. Salida: organigrama, roles y perfiles.
### 09 Productos y Servicios
Catálogo editable con fichas de oferta, alcance, tarifa, coste, margen, capacidad requerida, SLA, requisitos, estado y criterios de aceptación. Demo: atención/agenda, captación B2B, reactivación, gestión comercial, administración, finanzas, marketing/presencia, seguridad, gestión empresarial. Elegir dos prioridades por cliente sin activar nada. Salida: catálogo y reglas de prestación.
### 10 Mercado y Competencia
Cuadernos de investigación, segmentos, perfiles cliente ideal, competidores, fuentes, oportunidades, amenazas, tendencias y hipótesis comerciales. Tablas y mapas conceptuales; distinguir evidencia de inferencia. Demo: pymes españolas pequeñas y autónomos con dolores comerciales/administrativos; agencias tecnológicas como canal propuesto. No inventar investigación de competidores como hecho. Salida: estudio de mercado y estrategia de captación.
### 11 Diseño Económico
Editor financiero con ingresos, costes fijos/variables, presupuesto, escenarios, tesorería, cuentas, libros, facturas históricas importadas, conciliación y convenciones fiscales. Separar histórico observado y proyección; acceso restringido. Demo: ocho suscripciones a 1000 EUR implican 8000 EUR MRR base, diez implican 10000 EUR; implantación 1500 EUR por cliente, costes de infraestructura/modelos/herramientas sin inventar cifras verificadas. Salida: modelo económico, presupuestos y configuración contable; publicar no reescribe libros ni ejecuta pagos.
### 12 Ecosistema Empresarial
Agenda de proveedores, socios, colaboradores, clientes y prospectos; ficha, contactos, relaciones, contratos, vencimientos, servicios, dependencia, coste, calendario y evidencias. Grafo y listas. Demo: ocho historias de cliente como objetivo de fixture; Taller Horizonte es un ejemplo narrativo de founder, no registro real; proveedores adicionales deben ser ficticios y etiquetados. Salida: directorio y relaciones, vínculos con compras, CRM y agenda.
### 13 Diseño Operativo
Reutilizar Estudio Demo: inspector, visualizador, timeline; Kanban, grafo, Empresa 360 y escenarios cuando disponibles. Mapear AS-IS, dolores/causas, TO-BE, cadena de valor, responsables, recursos, entregables, excepciones. Demo: captación→discovery→propuesta→contrato→compilación→implantación→formación→beta→operación→feedback; dos cadenas: captar clientes y entregar valor. Salida: mapa operativo, backlog de implantación y relaciones.
### 14 Ingeniería de Procesos
Editor de SOPs con trigger, entradas, pasos, salidas, roles, reglas, aprobaciones, fallos, reintentos, evidencia y criterios. Kanban de diseño, versiones, ensayo sintético, dependencias. Ejemplo: preparar propuesta desde discovery y aprobación owner; caso bloqueado por información faltante. Salida: especificaciones SOP candidatas, no ejecución real. Reutilizar tareas y automatizaciones, no convertirlas en un listado de jobs productivos.
### 15 Arquitectura Tecnológica
Launcher y catálogo de capacidades empresariales, conectores, agentes, memorias, herramientas, requisitos, coste, riesgo y disponibilidad. Seleccionar capacidades, diseñar perfiles, mapear permisos y dependencias; distinguir deseada, simulable, implementada, verificada, habilitada y bloqueada. Demo: atención/agenda y captación como candidatos de alto retorno; no fingir integraciones verificadas. Salida: manifiesto de capacidades, configuración propuesta y plan de pruebas.
### 16 Desarrollo del Talento
Reutilizar Formación V4 y Equipo: itinerarios por rol, microlecciones, ejercicios contextualizados, simulaciones, competencias, evidencias y preparación. Diseñar plan inicial y actualización semanal adaptada; owner no necesita aprender prompts. Demo: aprobar propuesta, revisar tarea de Marcos, gestionar incidencia, leer economía; ejercicios sin efectos externos. Salida: plan formativo y evaluación de preparación.
### 17 Gobernanza
Panel de políticas, roles, permisos, consentimientos, privacidad, seguridad, riesgos, auditoría, límites de autonomía, aprobaciones y evidencia. Owner/administrador autorizado gestiona publicación; especialistas revisan su área, empleados aportan fuentes según permisos; LAIA presenta propuestas. Matriz propuesta, no política ya vigente. Demo: contrato, cambio de permisos o pago exigen control apropiado; ningún botón simula acción real sin etiqueta. Salida: políticas y decisiones aprobables.
### 18 Versiones y Publicación
Historial V1…V8 como ejemplo, rama de borrador activa, comparación por sección/artefacto, comentarios, revisión, previsualización de app operativa, publicar y resultado, volver a versión anterior como nueva propuesta. Vista de dependencias e impacto. No imponer ocho etapas obligatorias. Demo: empresa vacía, captura inicial, borradores sucesivos, V7 publicada y V8 draft como ejemplo opcional independiente de fases 0–8. Salida: release de especificaciones. Publicación demo local, no deploy, no conector, no transacción real.

## 5. Comportamiento transversal
- Shell compartido parametrizado por modo; preservar navegación, split view, rail plegable, chat y responsive. Cambiar título, iconos y acento contenido tierra, sin introducir otro design system. Mantener separación de estado, orden de menú y selección por modo/tenant/revisión.
- Barra persistente: Tu Empresa, empresa seleccionada, revisión, estado guardado, historial, previsualizar, publicar (según permiso), volver a la empresa. No confundir guardar con publicar.
- Misma fuente lógica por dato: original, hecho estructurado, artefacto generado, propuesta, decisión; procedencia y vigencia. Reutilizar IDs, no copiar datos a cada sección.
- LAIA entrevista y presenta; Cognition estructura; JEV/contratos validan; kernel/runtime gobiernan futura activación. En PMV todo simulado.
- Estados: vacío, capturando, propuesta, revisión, validado, publicado, bloqueado, archivado. Estado de revisión de empresa independiente del estado de artefactos, capacidades y fases. Permitir edición no lineal.
- Móvil: menú y chat según patrones existentes, navegación con contexto y controles táctiles; no miniaturizar escritorio. Accesibilidad, foco, reduced motion.
- Publicar una definición no borra registros operativos ni mueve dinero. La versión activa permanece hasta activación autorizada. Diferenciar previsualización de datos históricos y entorno operativo.

## 6. Dataset de referencia
Tenant agntia-demo, empresa simulada AgntiaPro, owner ficticio separado del real; LAIA, Marcos, Antonio, Juan, Ana, Pedro, equipo humano y colaboradores diferenciados. IDs estables, correos .example, reloj lógico reproducible. Tres realidades separadas: negocio ficticio, capacidad real del producto, presentación UX. 90 días, historial extensible a seis meses. Metas orientativas: 120 prospectos, 240 contactos, 65 oportunidades, 8 clientes activos, 24 proyectos, 450 tareas/ejecuciones, 800 conversaciones/mensajes, 160 documentos, 140 facturas/movimientos, 2000 eventos. No son registros materializados confirmados. Primero historias completas, luego volumen.
Narrativa Taller Horizonte: pierde llamadas y tarda en presupuestos; conversación LAIA, discovery, propuesta atención y seguimiento, aceptación, contrato, factura, proyecto, tareas Marcos, herramientas autorizadas, resultados simulados. Añadir excepciones: integración bloqueada, cambio de alcance, factura pendiente y aprobación tardía. Vincular los mismos IDs a fuentes, modelo, estrategia, economía, operaciones, SOPs y versiones.
Las fixtures actuales de apps/web/src/demo/fixtures.ts son de Interfaz Studio (Ana Ferrer, Marta, Bruno etc.), con fechas relativas a Date.now; no constituyen dataset canónico Agntia Demo. No migrar sus identidades. Inspeccionar fixtures de cada módulo antes de poblar nuevas vistas; materialización íntegra del dataset pendiente de inventario.

## 7. Cobertura de taxonomías
01 identidad→Identidad/Branding; 02 negocio→Modelo/Catálogo/Economía; 03 organización→Organizativo; 04 actores→Organizativo/Ecosistema; 05 relaciones→Fuentes/Identidad/Ecosistema; 06 comercial→Mercado/Modelo; 07 clientes→Ecosistema/Catálogo; 08 proyectos→Estrategia/Operativo; 09 finanzas→Económico; 10 personas→Organizativo/Talento; 11 procesos→Operativo/Ingeniería; 12 agentes→Organizativo/Tecnológica; 13 conversaciones→Entrevistas; 14 memoria→Fuentes/Entrevistas/Identidad; 15 runtime→Ingeniería/Tecnológica; 16 eventos→Estudio/Versiones; 17 gobierno→Gobernanza; 18 inteligencia→Estrategia/Economía/Estudio. Seis ejes en cada entidad: identidad, semántica, temporalidad, ciclo de vida, autoridad/procedencia, simulación.

## 8. Fases de empresa, no versiones
0 sandbox, 1 compilación, 2 no especificada por founder (ensayo es propuesta derivada), 3 formación, 4 PMV beta con validación obligatoria, 5 deploy completo del alcance aprobado, 6 feedback/ajustes/monitorización acompañada, 7 alpha (alcance pendiente), 8 scale y Digital Twin. No equiparar V8 a fase 8. El compilador puede utilizarse en cualquier fase; publicación de borrador no implica salto de fase ni autorización de servicios.

## 9. PMV visual e interactivo
A. Composición del shell existente y modo completo, navegación propia, fixtures vacías, retorno.
B. Adaptar superficies maduras por reutilización de componentes. No duplicar código sin necesidad; prototipo aislado en UI Lab no destructivo.
C. Poblar estados de Agntia Demo coherentes y enlazados; captura multimedia local simulada, edición y revisión.
D. Versionado local funcional: crear draft, editar, comparar, preview, publicar demo y comprobar que versión activa cambia sin perder originales.
E. Refinamiento visual e iconográfico y QA 9+ objetivo (no nota concedida). Desktop/tablet/móvil, teclado, estados vacíos/error, vistas divididas, continuidad del chat y ausencia de fugas entre modos. Build y capturas antes de declarar terminado.
F. Solo después auditoría técnica de contratos y permisos reales, sin imponer backend en el diseño ni desplegar sin autorización.

## 10. Aceptación y límites
El owner puede empezar sin datos, hablar, aportar material, abrir cualquier dimensión, editar artefactos, revisar propuestas, ver la empresa compilada y publicar una revisión simulada. Las 18 entradas deben conducir a experiencias útiles y no placeholders; la cantidad de entradas y etiquetas es propuesta revisable. Reutilizar UX sin limitar semántica ni inventar nuevas plataformas. Mantener guía de marca común y personalización empresarial separada. No modificar producción, código funcional, ramas o documentos raw por este documento. No se ha inspeccionado el navegador publicado ni inventariado todos los fixtures dispersos; la recuperación de founder/CEO tuvo un límite de salida, por lo que el siguiente agente debe releer íntegramente las fuentes antes de implementar.