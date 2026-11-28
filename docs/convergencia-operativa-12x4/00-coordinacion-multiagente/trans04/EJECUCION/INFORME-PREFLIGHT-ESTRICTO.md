# Trans04 — preflight estricto, parcial T04-S/S2

Código `ea572377` y `1c1dbaf0`. `secrets-check` rechaza opciones, perfiles, grupos o modos desconocidos (exit 2); añade `--strict`, `--profile` y `--json`. Las incoherencias del subconjunto solicitado bloquean el perfil estricto (exit 1); el modo informativo conserva su comportamiento. `leads` vacío pasa; `deploy` requiere live y configuración obligatoria.

No imprime valores, longitudes de secretos ni URLs recibidas; solo presencia y nombres. GitHub-first, entorno ya inyectado, Doppler opcional. Valida los perfiles Fast/Slow implementados y el formato de la clave de cifrado sin modificar ningún valor. La ausencia de BUSINESS_DATABASE_URL corresponde al dataset local actual, no se afirma una consulta SQL contra el DSN principal. Un DSN de negocio idéntico al principal sigue rechazado en estricto.

Pruebas locales previas a commit: 6/6 PASS, cero SKIP; las cinco regresiones iniciales fallaban antes. Logs `/tmp/trans04-secrets-preflight-{red,complete}.log`. Primer green tuvo una aserción demasiado amplia sobre texto estático de requisitos; se corrigió para comprobar las filas de presencia sin eliminar la comprobación de fugas. Typecheck raíz/worker exit 0.

No se han cambiado almacenes, DSN, claves, workflows, Supabase ni documentación operativa original. No certifica inyección CI ni separación efectiva de entornos: manifiesto S0, workflow S1, resto S2/S3/S4 continúan pendientes.
