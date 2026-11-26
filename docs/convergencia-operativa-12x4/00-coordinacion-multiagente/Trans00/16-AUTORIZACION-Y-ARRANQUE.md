# Autorización de inicio E-M1 — pendiente del founder

Esta es una propuesta de acto, no una autorización ya recibida. D-M3 documental terminado. No ejecutar por leerla.

## Mensaje que puede autorizar el founder

> Autorizo E-M1 de Trans00 y Trans01–06 en entorno aislado, con integración incremental, recuperación selectiva de los deltas verificados, creación de la rama de integración y seis ramas de ejecución desde base común, pruebas locales/CI herméticas, cambios funcionales dentro de reservas y revisión técnica B1/B2. No autorizo merge a main, tags, despliegues, efectos externos reales, owner real, acceso a datos reales ni cambios en Supabase producción. Conserva las ramas originales. Registra evidencias y detente al terminar E-M1.

El acto debe fijar después docSHA, main refrescado, I0 real, ramas y reserva. No se exige que el founder proporcione datos técnicos que el supervisor puede consultar. T00 puede iniciar el preflight de I0 bajo este permiso y emitir asignaciones solo tras registrar su SHA y estado; si no hay runner, queda bloqueada certificación, no improvisar.

## Seguridad de refs y workflows comprobada en main 6d06cf364321ee169a3caf47ac3bf922c299c55b

| Workflow | Trigger observado | Restricción de E-M1 |
|---|---|---|
| ci.yml | push main, pull_request | PR hacia integración puede ejecutar CI; revisar permisos y que no tenga secrets producción. No asumir push rama ejecuta CI |
| configure-prod-db.yml | workflow_dispatch manual, apply default true, environment production | no disparar ni con supuesto dry run; puede aplicar DSN/desplegar |
| deploy.yml | push tags v*, workflow_dispatch | no tag ni dispatch, env libre actual, no prod fallback; S1/S2 futuras |
| generate-editorial-images.yml | push main path específico, dispatch | no activar: puede llamar API y crear rama/PR |
| ui-lab-chat-ux-v2-qa.yml | branch feat/ui-lab-chat-ux-v2 y paths, dispatch | no tocar UX ni disparar |
| ui-lab-pages.yml | push main paths UI/domain/lock, dispatch | publicación Pages fuera del alcance; no merge main |
| ui-lab.yml | push lista ramas/main paths UI/domain/lock, dispatch | no deploy, no manual dispatch |

Revisar nuevamente todos los workflows antes de crear refs y antes de PR (incluidos cambios en workflow propuestos por T04). Integración en nombres no listados y sin tag no activa por los triggers observados los workflows de deploy, producción DB o generación de imagen; no garantiza reglas externas del hosting, GitHub Apps, Vercel/Fly integraciones o settings que no se han inspeccionado. Confirmar mediante owner/settings si esas integraciones se ejecutan en cualquier branch. Si no puede verificarse, preparar local/staging sin push funcional que pueda desplegar hasta autorización. En PR CI no pasar secretos prod, no `pull_request_target` ejecutando código no confiable, permisos mínimos.

## Credenciales

El founder ha indicado Supabase ya operativo y Doppler problemático. No solicitar que pegue valores por chat. T04 prepara manifest GitHub-first, 02/03 validan nombres/consumidores y 01 wiring. Fast/Slow/Embeddings key + provider/model; JEV/Anam/ElevenLabs/Grafana configuración cuando se habilite y contratos verificados; Google/WhatsApp/Resend según slice. Tener credencial no acredita integración. En E-M1 fixtures/synthetic y red hermética, no depende de que estén todos los secretos. E-M2 sandbox/preview requiere acto separado para llamada/coste. No leer secretos de producción para pasar tests.

## Antes de asignar a los seis

- Confirmar runner real (Codex/Freebuff/GitHub CI adecuado) con repo y tests; Trans00 actual dispone de acceso documental GitHub pero no ha ejecutado checkout, tests ni deploy.
- Revalidar manifest 09 contra main actual; 50 entries al cierre, no promesa si se mueve. Obtener I0 probado o registrar fallo exacto.
- Crear refs solo tras autorizar; publicar acta B1/estado de bloqueos y 6 asignaciones exactas. Repos históricos quedan.
- Entregar [prompt común](12-PROMPT-COMUN-EJECUCION.md) y prompt de rama, docs Trans00 fijados, su SHA original, rama de ejecución, base exacta, permisos, reservas y enlace de acta. No lanzar al agente con solo el nombre de campaña.
- B1/B2 revisión técnica; al llegar B2 founder recibe reporte y decide E-M2. NO_GO funcional actual se conserva.
