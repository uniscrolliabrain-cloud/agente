# Nomenclatura de pantallas de AgntiaPro — referencia UX

Fuente: decisiones del founder en el chat UX del 23-11-2026, estructura documental de 19 secciones y catálogo comercial de 34 Apps. Esta es la **nomenclatura objetivo para futuras modificaciones de la aplicación real**, no una declaración de que se hayan renombrado rutas o componentes en `apps/web`. El código de producción conserva sus identificadores hasta una campaña de migración aprobada.

## Pantallas y superficies principales — orden aprobado

| Nº | Nombre de interfaz | Carpeta documental | Estado UX |
|---:|---|---|---|
| 01 | Landing | `01-landing` | Aprovechable |
| 02 | Login | `02-login` | Por diseñar; prompt V2 |
| 03 | Legal | `03-legal` | Por diseñar |
| 04 | Chat — botón transversal | `04-chat-boton-transversal` | Por diseñar |
| 05 | Perfil | `05-perfil` | Por diseñar |
| 06 | Ajustes | `06-settings` | Por diseñar |
| 07 | Menú lateral | `07-menu-lateral` | Por diseñar |
| 08 | Centro de Mando | `08-centro-de-mando` | Aprovechable; conservar por ahora |
| 09 | Chat | `09-chat` | Aprovechable |
| 10 | Estudio de Operaciones | `10-estudio-de-operaciones` | Pendiente de validación |
| 11 | Apps | `11-apps` | Launcher por diseñar |
| 12 | Comunicación | `12-comunicacion` | Por diseñar |
| 13 | Automatizaciones | `13-automatizaciones` | Aprovechable |
| 14 | Documentos | `14-documentos` | Por diseñar |
| 15 | Conocimiento | `15-conocimiento` | Por diseñar |
| 16 | Proyectos | `16-proyectos` | Por diseñar |
| 17 | Equipo | `17-equipo` | Aprovechable |
| 18 | Data | `18-data` | Por diseñar |
| 19 | General | `19-general` | Documentación transversal |

**20 · Formación — Trabaja con LAIA:** [documentación de la nueva sección](../20-formacion/README.md). Experiencia audiovisual inspirada en una biblioteca musical, 50 reels prácticos y 10 ejercicios de introducción; diseño y código pendientes. Es una sección general del producto, no una de las 34 Apps.

**Superficies aprovechables adicionales:** Estudio Demo y Tareas. No equiparar Estudio Demo con Estudio de Operaciones sin verificar sus componentes. **Control de actividad, Inicio/Hoy, Usuarios y Operaciones** aparecen como vistas técnicas del laboratorio, pero no se deben inventar como nuevas entradas del menú definitivo. Su ubicación final está pendiente.

## Apps — los 34 nombres comerciales propuestos

Estos son los nombres del catálogo, **no** los nombres de las plataformas de inspiración. El orden se corresponde con los identificadores técnicos 01–34. La fuente exhaustiva (carpetas, inspiración y rutas) es [CATALOGO-34-APPS.md](../11-apps/CATALOGO-34-APPS.md).

| Nº | Nombre | Nº | Nombre |
|---:|---|---:|---|
| 01 | Correo | 18 | Equipo |
| 02 | Conversaciones | 19 | Personas |
| 03 | Relaciones | 20 | Gastos |
| 04 | Facturación | 21 | Cobros |
| 05 | Archivos | 22 | Diseño |
| 06 | Agenda | 23 | Publicaciones |
| 07 | Plan de Trabajo | 24 | Tienda |
| 08 | Asistente | 25 | Soporte |
| 09 | Registros | 26 | Inventario |
| 10 | Objetivos | 27 | Mantenimiento |
| 11 | Tesorería | 28 | Producción |
| 12 | Compras | 29 | Cumplimiento |
| 13 | Rentabilidad | 30 | Accesos |
| 14 | Atención | 31 | Portal Cliente |
| 15 | Firmas | 32 | Conocimiento |
| 16 | Automatizaciones | 33 | Observabilidad IA |
| 17 | Procedimientos | 34 | Tableros |

**Centro de Mando no es la App 35 del catálogo comercial**: es una superficie transversal con carpeta propia. Se conserva su identificador técnico histórico `35-centro-mando` hasta cambiar código explícitamente.

## Reglas de nomenclatura

1. El usuario ve nombres de AgntiaPro; las marcas de inspiración se documentan solo como referencias de diseño.
2. Las 20 superficies generales y las 34 Apps son niveles distintos; no duplicar 34 entradas en el menú principal ni convertir el laboratorio en otro menú.
3. El selector de UI Lab muestra **solo vistas que realmente puede renderizar**. Las fichas sin implementación de preview siguen siendo documentación; no crear botones que lleven a pantallas ficticias.
4. Para renombrar el menú de `apps/web`, mapear etiquetas visibles y rutas por separado, con pruebas de navegación y aprobación específica. No renombrar carpetas técnicas automáticamente.
5. «Aprovechable» no significa «aprobado definitivamente», «implementado» ni «desplegado».
