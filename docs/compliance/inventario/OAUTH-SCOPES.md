# Scopes OAuth

- Login Google `openid email profile`, login GitHub `read:user user:email`. Código en `oauth-login.ts`. Los enlaces legales de la app no intervienen en el intercambio.
- Google Workspace lectura: `gmail.readonly`, `calendar.events.readonly`, `calendar.calendarlist.readonly`, `drive.readonly` bajo `https://www.googleapis.com/auth/`.
- Escritura añade `https://mail.google.com/`, `gmail.send`, `gmail.modify`, `calendar`, `calendar.events`, `drive`, `openid`, `userinfo.email`, `userinfo.profile`. La ficha muestra scopes devueltos por el conector, sin exponer credenciales OAuth. La solicitud evita agregar autorizaciones anteriores por defecto. Gmail completo, Calendar y Drive completos siguen siendo amplios; reducirlos por capacidades requiere validar las operaciones existentes.
- State operativo en records, PKCE y expiración de diez minutos, credenciales por tenant y autorizante; desconexión local seguida de revocación del proveedor.
- Fundador: verificar clientes separados, atribución histórica, consola, dominio, Redirect URI, [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy) y revisión de scopes sensibles/restringidos. No se consultó ni editó la consola.
