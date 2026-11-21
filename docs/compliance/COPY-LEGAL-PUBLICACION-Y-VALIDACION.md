# Copy legal integral: publicación, UX y validación

Fecha: 2026-11-21. Rama: feat/freebuff-compliance-integral. **Estado: borrador técnico; no aprobado.** Se han ampliado los seis HTML de apps/site con textos estructurados para el SaaS AgntiaPro. El gate de release debe seguir bloqueado.

## 1. Documentos completos de trabajo
- `apps/site/aviso-legal.html`: 8 apartados (titular, objeto, condiciones, IP, terceros, responsabilidad, datos, ley).
- `apps/site/privacidad.html`: 12 apartados (responsable, datos, finalidades/bases, tenants, IA/memoria, Google, voz, proveedores/transferencias, retención, derechos, seguridad, cambios).
- `apps/site/cookies.html`: 8 apartados (OAuth cookie técnica, storage, Google Fonts, opcionales, inventario, gestión).
- `apps/site/terminos.html`: 12 apartados (prestador, contratación, cuentas, conectores, datos, IA, usos, precios, SLA, responsabilidad, terminación, controversias).
- `apps/site/transparencia-ia.html`: 9 apartados (LAIA, runtime, voz/avatar, límites, aprobaciones, contenido, datos, contacto).
- `apps/site/confianza.html`: 8 apartados (documentos, seguridad, roles, derechos, IA, incidentes, contacto).

## 2. Copy UI exacto para componentes existentes
### Footer de landing
«AgntiaPro» · «Software y servicios de inteligencia artificial para empresas.»
Links: «Aviso legal» / «Privacidad» / «Cookies» / «Términos del servicio» / «Transparencia IA» / «Confianza y seguridad» / «Contacto».

### Login y OAuth
«Consulta nuestra Política de privacidad y los Términos del servicio antes de continuar.»
Enlaces: «Privacidad», «Términos», «Cookies».
Nunca usar «Al iniciar sesión aceptas el tratamiento de todos tus datos» ni presumir consentimiento para cookies por navegar.

### Ajustes
«Privacidad y datos»
«Consulta tus solicitudes, conexiones y la información sobre cómo se tratan tus datos.»
«Políticas y condiciones» / «Transparencia de IA».
«Solicitar una copia de mis datos» / «Solicitar rectificación» / «Solicitar eliminación» / «Consultar mis solicitudes».
Al registrar solicitud: «Hemos registrado tu solicitud. Puedes consultar su estado con la referencia indicada.» **Solo cuando el servidor devuelve referencia real.**
Estado recibido: «Solicitud recibida. Todavía no se ha ejecutado ninguna modificación de datos.»
Estado revisión: «Estamos comprobando el alcance de tu solicitud y la información necesaria para gestionarla.»
Estado respondido: «Tu solicitud tiene una respuesta registrada. Consulta el canal indicado para conocer su resolución.» **No afirmar que los datos fueron eliminados.**
Ayuda: «Algunos datos deben conservarse por obligaciones legales o de seguridad. La solicitud se evaluará conforme a la normativa aplicable.»

### Gobernanza empresa
«Privacidad de la empresa»
«Gestiona la información sobre tratamiento de datos, conectores y políticas aplicables a tu organización.»
«Acuerdo de tratamiento de datos» / «Proveedores y subencargados» / «Conservación» / «Solicitudes» / «Seguridad».
Pendiente: «Este control requiere una configuración o revisión adicional. No está disponible para ejecutarse desde este panel.»
No habilitar acciones sin permiso server-side.

### Conectores
«Qué datos puede utilizar esta conexión»
«Permisos concedidos» / «Datos consultados» / «Acciones autorizadas» / «Proveedor» / «Desconectar».
«Desconectar impide nuevos accesos desde AgntiaPro cuando la revocación se complete. No elimina necesariamente datos que ya se hayan procesado o conservado conforme a las políticas aplicables.»
Revocación pendiente: «Estamos verificando la desconexión con el proveedor. Comprueba también los permisos en tu cuenta externa.»
No decir «Todos tus datos han sido borrados» al revocar OAuth.

### IA / chat / voz / avatar
Chat: «Estás conversando con LAIA, un sistema de inteligencia artificial.»
Voz: «Soy LAIA, un asistente de inteligencia artificial.»
Avatar: «Avatar generado por IA».
Dictado: «Tu voz puede convertirse en texto para procesar tu mensaje. Consulta Privacidad para conocer los detalles.» **Adaptar al tratamiento realmente implementado.**
Información: «Las respuestas generadas por IA pueden contener errores. Revisa los resultados importantes.»
Acción con aprobación: «Esta acción requiere tu aprobación antes de ejecutarse.»
Nunca afirmar que LAIA es una persona o que el audio no se almacena sin pruebas del canal real.

### Cookies (solo si se detectan tecnologías opcionales)
«Tu privacidad importa»
«Utilizamos tecnologías necesarias para el funcionamiento y la seguridad. Con tu permiso, podremos activar otras finalidades descritas en nuestra Política de cookies.»
«Rechazar opcionales» / «Configurar» / «Aceptar opcionales».
«Necesarias — siempre activas» / «Guardar preferencias».
La AEPD exige ofrecer aceptar y rechazar al mismo nivel; no desplegar banner ficticio si no hay cookies opcionales.

## 3. Matriz de datos que DEBE aportar el fundador o verificar el equipo
| ID | Dato necesario | Documento | Bloqueo |
|---|---|---|---|
| LEG-01 | Razón social/nombre fiscal y NIF | Aviso, privacidad, términos | P0 |
| LEG-02 | Domicilio y registro mercantil si aplica | Aviso, privacidad | P0 |
| LEG-03 | Emails reales general, privacidad y seguridad | Todos | P0 |
| LEG-04 | Identidad responsable, DPO si aplica | Privacidad | P0 |
| LEG-05 | Inventario por finalidad, base jurídica, procedencia y categoría | Privacidad | P0 |
| LEG-06 | Proveedores ACTIVOS, ubicación, DPA, subencargados, transferencias | Privacidad, confianza | P0 |
| LEG-07 | Retención real por dataset, backups, logs, memoria y terceros | Privacidad, términos | P0 |
| LEG-08 | Cookies/storage/CDN/analytics reales y duración | Cookies | P0 |
| LEG-09 | Scopes Google exactos y política Google API Services User Data | Privacidad | P0 |
| LEG-10 | Condiciones comerciales, facturación, renovación, cancelación, SLA | Términos | P0 |
| LEG-11 | DPA y condiciones B2B revisados | Términos, confianza | P0 |
| LEG-12 | Canal operativo de derechos e incidentes, responsables | Privacidad, confianza | P0 |
| LEG-13 | Estado real de voz, Anam, ElevenLabs, grabación, transcripción | Privacidad, IA | P0 |
| LEG-14 | Clasificación AI Act por caso de uso, especialmente RRHH | IA | P0 |
| LEG-15 | Aprobación jurídica, fechas de vigencia, versión y mecanismo de publicación | Todos | P0 |

## 4. Procedimiento de cierre
1. Fundador completa datos LEG-01 a LEG-03 y condiciones comerciales LEG-10; no introducir secretos.
2. Ingeniería verifica datos técnicos con evidencia de código y despliegue; legal valida bases, transferencias, contratos y obligaciones.
3. Reescribir cada placeholder con afirmación exacta y comprobable. Revisión de cada documento por persona autorizada.
4. Cambiar `legal-status` de `draft` a `approved` solo tras aprobación documentada; a `published` únicamente tras decisión explícita de publicación. Actualizar `legal-version`, `title`, `robots` según estrategia y retirar avisos de borrador.
5. Ejecutar `node scripts/check-legal-site.mjs` y `node scripts/check-legal-site.mjs --release`; ambos deben pasar antes de solicitar despliegue. Verificar URLs reales, Google OAuth, accesibilidad y red.
6. No ejecutar despliegue ni merge sin autorización.

## 5. Fuentes normativas a revisar
- RGPD: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- AEPD cookies: https://www.aepd.es/documento/guia-cookies.pdf
- AI Act art. 50: https://digital-strategy.ec.europa.eu/es/faqs/transparency-obligations-under-article-50-ai-act

## 6. Alcance y límites
El código inspeccionado y el handoff de Freebuff respaldan que hay OAuth Google/GitHub, registro de solicitudes, controles tenant, cookies técnicas y avisos IA. No respaldan una promesa de eliminación automática universal, una lista cerrada de proveedores ni certificaciones de seguridad. El documento no es asesoramiento jurídico vinculante. **No alterar el gate para hacerlo pasar artificialmente.**
