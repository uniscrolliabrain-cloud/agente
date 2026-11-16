# Acciones del fundador — integraciones Cognition V2

**Estado: NO_GO.** No ejecutar contra empresas o datos reales hasta cerrar los gates de C15 y autorizar explícitamente un piloto. Ninguna clave debe pegarse en chat, commits o informes; usar el gestor de secretos del entorno correspondiente. Las pruebas locales sintéticas no requieren estas cuentas.

## Base de datos / Supabase, si se elige para el piloto

- Cuenta/proyecto: proyecto de pruebas aislado del proyecto y datos productivos, con Postgres compatible. Confirmar región, residencia de datos y DPA.
- Permisos: propietario de esquema solo para migraciones revisadas; aplicación con rol separado `NOSUPERUSER NOBYPASSRLS`, sin propiedad de tablas ni privilegios de administración. No usar rol de servicio en la aplicación. Falta integrar y validar RLS compartida de extremo a extremo; no quitar su bloqueo.
- Variables existentes: `DATABASE_URL` para servidor/worker; si se usa autenticación Supabase, `SUPABASE_URL` y `SUPABASE_JWT_AUD`; `SUPABASE_JWT_SECRET` solo si procede HS256. Guardar valores exclusivamente en secretos. Para operaciones empresariales separadas: `BUSINESS_DATABASE_URL`, con permisos mínimos de lectura según la capacidad.
- Callbacks: no hay callback de Supabase definido por este patchset; configurar únicamente los del flujo de autenticación efectivamente seleccionado después de verificar el contrato.
- Aceptación: dos tenants sintéticos y rol restringido, HTTP + kernel + workers + voz + bridge; sin scope no lee ni escribe, A no accede a B, revocación efectiva, restauración y rollback ensayados. Ninguna de esas pruebas está certificada por W11.

## Google Cloud / Google Workspace, si se integra

- Cuenta/proyecto: proyecto Google Cloud de pruebas y cuentas Workspace sintéticas; verificar pantalla de consentimiento OAuth y revisión requerida de scopes.
- Permisos: solo APIs y scopes necesarios para la operación autorizada; separar prueba de lectura y aprobación de efectos. No autorizar cuentas de clientes para pruebas sintéticas.
- Variables existentes: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y configuración de URL pública; el callback que usa el repositorio es `/api/google/callback` (la URL completa debe coincidir exactamente con el origen de prueba aprobado). Secretos solo en el almacén del entorno.
- Aceptación: OAuth completo y revocación con dos tenants de prueba; credenciales y resultados aislados, permiso insuficiente rechazado, y acciones mutantes bloqueadas hasta aprobación verificable. No ejecutar envíos o cambios reales sin autorización separada.

## TypeSafe / JEV

- Cuenta: organización y entorno de pruebas TypeSafe, acceso confirmado a los modelos fijados; acordar región, tratamiento de datos, DPA, retención, cuotas y coste.
- Permisos: autorización de exportación de datos por tenant/actor, minimización, presupuesto y revocación desde PDP confiable. `TYPESAFE_API_KEY` se suministra al servidor al construir el adaptador; el código actual no lo activa automáticamente.
- Callbacks: el contrato REST documentado no requiere callback en el flujo actual; no inventar uno.
- Aceptación: sandbox con texto sintético minimizado, recepción y contabilización de uso, revocación/timeout/resultado incierto sin reenvío automático, límites de cuota y corpus de calibración. No se ha ejecutado inferencia externa.

## Anam / voz

- Cuenta: sandbox Anam con avatar y modo aprobados; confirmar contratos, región, DPA, retención, costes y compatibilidad de audio.
- Permisos: emisión de tokens breves desde servidor, identidad y consentimiento por tenant; no exponer la clave de proveedor al cliente. El adaptador real de Anam no está implementado y **no existe aún un nombre de variable ni callback definitivo en este repositorio**: fijarlos tras verificar contrato/SDK y modo de integración, sin adivinarlos.
- Aceptación: sesión sintética completa, token caducado/revocado, interrupción y ACK de reproducción física, desconexión y limpieza remota, navegador/móvil y coste medido. No confundir finalización de texto con reproducción.

## Puente de ciberseguridad

- Cuenta/permiso: entorno hijo sintético independiente; un responsable debe aprobar mapping de PDP, manifest, broker, delegaciones humanas, licencia del SDK privado y DPA. El SDK alpha declara `UNLICENSED`.
- Variables/callbacks: no hay configuración productiva ni callbacks de autorización finales cableados en el padre; concretarlos al implementar el bootstrap, sin inventar secretos.
- Aceptación: consultas de lectura autorizadas, denegación cross-tenant, delegación revocada, relay con commit antes del ACK y recuperación sin duplicados contra el hijo sintético. No activar jobs mutantes.
