# Audit 01 — Cartografía inicial (entrega parcial)
Fecha: 2026-11-27. Baseline main: ce032d9083ea8ee5332730d973709c442aa523a0.
Mandato: solo documentación en esta rama. Madurez global 15% estimada por fundador; PMV Agntia Demo con vertical slices WhatsApp/Google y otros acotados. No equivale a cobertura ni certificación.
## Inventario observado
18 repos accesibles: agente, agntia-video, agntia-gestoria, agntia-ciberseguridad, agntia-formacion, agntia-redes, agntia-clientes, agntia-marketing, agntia-ventas, agntia-branding, agntia-finanzas, agntia-legal, agntia-seguros, agntia-dise-o, agntia-comunicacion, agntia-iadev, agntiapro-acme, agntia-iamotion. Los dos privados son diseño y comunicación. Todos declaran main. IAMotion registra tamaño 0; no acredita ausencia de trabajo posterior.
## Superficies
apps/{server,web,site,ui-lab,worker,computer}; packages/{domain,integrations,backends,workspaces}. No existe workspaces/ raíz en el listado observado aunque pnpm-workspace.yaml lo contempla. vendor contiene agntia-ciberseguridad-0.1.0-alpha.2.tgz, referenciado por package.json. No acredita backend desplegado.
## Ramas de investigación
| Rama | HEAD observado |
|---|---|
| Trans00 | 76abcf48eb3ba48c94aff40444804e53955c6697 |
| Trans01 | 61b76ac514039fd9d3188dffc33abf2a2c28016a |
| Trans02 | 5fc0ec4a90c3ce22755cb87b57c3d224664d2018 |
| Trans03 | 7e847bf86c46b192d79d76e96ed791af52a21bd6 |
| Trans04 | 7c422f9a0f6d5686434466669c7df2f12255311e |
| Trans05 | 46529cabd8479c9e1be6da8459485137999f40f2 |
| Trans06 | db5da93775401fe0d582d3cffe30f8d33a8b21c6 |
| exec/Trans01 | fa0fee958ad20f306800711eaa27352500ea103c |
| exec/Trans02 | bf1d7e18b1cf213b530c660dca33cda9324841c6 |
| exec/Trans03 | 5e8b1272284624faf653e122268f66292b91ec82 |
| exec/Trans04 | dd5d26347bf0dad607e7df5f0df38410981ac689 |
| exec/Trans05 | ba56896b23b926b1a4fe134af92e4b30e4ab3434 |
| exec/Trans06 | 7663df43e73ab8e116c39e105b8d1bb3475a9cf5 |
| integration/trans00-core | 9650aac71abcceef308681ab49a381d20e7584ff |
| campaign/convergencia-operativa-12x4 | 8672f8c1035067e77de76080aabbe8d4c8030fe5 |
No inferir integración por nombre. Comparar ancestry, diffs, tests y contratos.
## Vigencia documental
README raíz leído: intención vigente, distingue arquitectura objetivo de certificación. README-VIEW-SPEC leído: guía vigente con enlaces legacy. docs/WHITEPAPER.md (615 líneas) y whitepaper.md (459 líneas): inspección parcial de encabezados e inicio, no lectura integral acreditada. El primero comienza con código CLI de rollback ajeno al whitepaper; el segundo mezcla v1 de octubre con propuesta Trans06. Confianza alta en anomalía textual, no en su causa. docs/README.md índice de 7 noviembre, inspección parcial. README raíz afirma repo privado, API devuelve público: discrepancia de metadata, no cambiar permisos.
## Método de madurez
Por cada unidad inventariada: conceptualizada, especificada en auditoría/campaña, implementada, consolidada (wiring y pruebas), refactorizada (evidencia de sustitución coherente), hardenizada (pruebas negativas y recuperación), producción (evidencia operativa). Denominadores explícitos por universo y revisión; desconocidos separados de ausentes; no promediar etapas como si fueran independientes. 15% es referencia del fundador, no resultado de auditoría.
## Secuencia
01 cartografía; 02 núcleo; 03 extensibilidad; 04 producto; 05 datos y conversación; 06 convergencia; 07 taxonomía microgranular de ontologías y contratos; 08 síntesis.
## Límites
Sin pruebas ejecutadas ni lectura completa del árbol, lockfile, campañas o repos hijos. No se emiten porcentajes técnicos todavía. Esta entrega no cierra Audit 01.
