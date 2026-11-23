# Formación · Trabaja con LAIA

> **Deja de aprender la IA y empieza a trabajar con LAIA.**

Estado: **diseño documental, no implementado**. Documentación integrada en `main`, en el apartado Formación de UI Lab. No activar integraciones ni modificar runtime sin una campaña posterior.

## Visión
La sección **Formación** es una parte de AgntiaPro con experiencia de descubrimiento audiovisual inspirada en la organización de una biblioteca musical (colecciones, portadas, continuidad, reproducción y recomendaciones), **sin copiar marca, identidad visual ni interfaz de Spotify**. Respetar tokens y componentes reales de la landing AgntiaPro; verificar el branding actual antes de desarrollar.

La unidad pedagógica es un reel de 20–45 s producido con IA, con subtítulos, caption, demostración verificable y CTA contextual: **Conectar aplicación** si no está autorizada, **Pruébalo con LAIA** si ya lo está. La autorización es reutilizable entre ejercicios y revocable. Nunca forzar conexiones para ver contenido.

## Inventario
- [50 ejercicios cotidianos](./ejercicios/50-reels.md), agrupados en 5 colecciones de 10.
- [10 ejercicios de introducción profesional](./ejercicios/10-introduccion.md).
- [UX de Formación](./UX-FORMACION.md).
- [Contrato de microcurso](./CONTRATOS-Y-DATOS.md).
- [Arquitectura Cognition V2 / Composio](./ARQUITECTURA-Y-SEGURIDAD.md).
- [Producción de reels](./PRODUCCION-Y-CAPTIONS.md).
- [Plan de implementación y pruebas](./IMPLEMENTACION-FUTURA.md).

## Invariantes
1. LAIA es la interfaz conversacional, no ejecutora autónoma de APIs.
2. El LLM solo propone intenciones y argumentos; **Cognition V2** es el puente definitivo. El puente cognitivo anterior es legado a retirar tras migración verificada.
3. Kernel y runtime determinista autorizan, compilan/interpretan SOPs tipados Zod y ejecutan adaptadores registrados.
4. Composio es un proveedor de OAuth/conectividad, nunca una lista libre de tools para el LLM.
5. Separación de identidad, tenant, cuenta personal y empresarial, aprobaciones, auditoría, recibos, idempotencia y revocación.
6. Un conector autorizado se reutiliza para varios ejercicios dentro del mismo scope; la UI jamás solicita reconexión innecesaria.
7. Los ejemplos son **ideas sujetas a validación de disponibilidad de APIs, permisos, restricciones comerciales y acciones por proveedor**.

## Alcance de esta rama
Solo documentación y material de preparación. No hay UI, vídeos, SDK, OAuth, SOPs nuevos ni despliegue.
