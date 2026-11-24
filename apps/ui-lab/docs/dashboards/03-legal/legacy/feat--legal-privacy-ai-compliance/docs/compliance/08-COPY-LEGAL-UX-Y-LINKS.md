# Copy, enlaces y campos de aprobación — AgntiaPro

## Enlaces definidos para web estática (implementados en esta rama)
- `/aviso-legal.html` — Aviso legal
- `/privacidad.html` — Política de privacidad
- `/cookies.html` — Política de cookies
- `/terminos.html` — Términos del servicio
- `/transparencia-ia.html` — Transparencia sobre inteligencia artificial
- `mailto:hola@agntiapro.com` — Contacto (confirmar buzón)
Las rutas son relativas a `apps/site`; NO asumir que están servidas desde el host de `apps/web`. Verificar DNS y hosting.

## Copy exacto — web/footer
Marca: «AgntiaPro».
Descriptor: «Software y servicios de inteligencia artificial para empresas.»
Disclaimer: «Los agentes y avatares identificados como IA son sistemas artificiales.»
CTA: «Contacto».

## Copy exacto — login
«Al continuar, puedes consultar nuestra Política de privacidad y los Términos del servicio.»
Links: «Privacidad», «Términos», «Cookies».
No usar «Al iniciar sesión aceptas...» hasta diseñar registro de aceptación contractual.

## Copy exacto — cuenta
«Privacidad y datos» / «Consulta cómo se tratan tus datos y gestiona tus solicitudes».
«Mis datos» / «Consulta o solicita una copia de los datos de tu cuenta».
«Datos de mi empresa» / «Disponible únicamente para usuarios autorizados».
«Conexiones externas» / «Consulta y revoca conexiones cuando estén disponibles».
«Solicitar una copia» / «Solicitar rectificación» / «Solicitar eliminación» / «Ver mis solicitudes».
Confirmación: «Hemos recibido tu solicitud» SOLO cuando API devuelve confirmación real con identificador. Nunca fingir éxito.

## Copy exacto — cookies (solo si aplican opcionales)
Título: «Tu privacidad importa».
Cuerpo: «Utilizamos tecnologías necesarias para que el sitio funcione. Con tu permiso, también podremos usar otras categorías descritas en la Política de cookies.»
Acciones: «Rechazar opcionales», «Configurar», «Aceptar opcionales».
Preferencias: «Necesarias (siempre activas)», «Analítica», «Marketing», «Guardar preferencias».
No crear categorías que no existen en inventario real.

## Copy exacto — transparencia IA
Chat: «Estás conversando con LAIA, un sistema de inteligencia artificial.»
Voz: «Soy LAIA, un asistente de inteligencia artificial.»
Vídeo: «Avatar generado por IA».
Salida: «Este contenido se ha generado con ayuda de inteligencia artificial» cuando corresponda por contexto y obligación aplicable.

## Campos jurídicos bloqueantes para publicar
Identidad legal, NIF/CIF, domicilio, email responsable privacidad, datos registrales si proceden, finalidades y bases legales por tratamiento, categorías de interesados, retenciones, proveedores y transferencias, ejercicio de derechos, cookies reales, DPA, precios/condiciones contractuales y responsable de incidentes. El copy HTML actual está marcado Borrador y noindex. No eliminar avisos sin aprobación.
