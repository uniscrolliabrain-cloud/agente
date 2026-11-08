# 11 · Conexión operativa Google y ciclo de credenciales — REPORTE

**Estado:** completa · **Entrada:** `56f473b` (campaña 10).

## Qué se ha implementado

### 11.P1 · Contrato de la conexión

`GoogleAuth.connection(owner)` devuelve la conexión operativa como registro:
`{ id, tenantId, provider, account, scopes, write, generation, authorizer, connectedAt }`.

Antes solo existían tokens cifrados: ni el panel ni la verificación podían decir a qué empresa servía la cuenta, quién había autorizado el consentimiento ni si seguía vigente. La atribución (`tenantId`, `authorizer`, `provider`) se escribe en la fila `credentials/google` y viaja también dentro de los tokens cifrados, de modo que la lectura no depende del scope en curso.

`GET /api/google/status` expone además `provider`, `scopes` y `write`: el panel ya recibe la cuenta y los scopes concedidos, no solo "conectado".

### 11.P2 · Ciclo de credenciales

- **PKCE y CAS se conservan** (11.P1 de la campaña 06 no se toca): `state` de un solo uso con `take` y `code_challenge` S256; la rotación de generación invalida callbacks y operaciones preparadas con la conexión anterior.
- **Membership revalidada en callback y refresh** (`assertMembership`): el callback restaura el tenant desde el `state` y, antes de canjear el código, comprueba con lectura fresca (`tenantService.findMembership`) que el autorizante sigue en la empresa. El refresh hace lo mismo antes de hablar con Google. Un fallo del store es 503, no "no es miembro".
- **Desconexión**: siempre rota la generación y limpia localmente, aunque la membership ya no exista; la revocación remota es best-effort y no puede dejar la credencial viva.
- **Migración solo de credenciales atribuibles**: una conexión sin `tenantId` registrado no se adopta como conexión de la empresa (se informa `tenantId: null`, nunca se inventa) y no se policia por membership. Al reconectar, el consentimiento la atribuye a la empresa donde se pidió.

### 11.P3 · Bordes y compatibilidad

- **Login separado del consentimiento**, y ahora documentado abajo: rutas, clientes y scopes distintos.
- **Mínimo privilegio**: el consentimiento pide solo los scopes de lectura por defecto y añade el juego de escritura solo si la operación lo pide. Antes se arrastraban los scopes ya concedidos, así que reconectar en solo lectura seguía pidiendo Gmail y Drive completos.
- `apps/web/src/api/google.ts` declara `provider`, `scopes` y `write` en `GoogleStatus`.

## Configuración OAuth (P3)

| Variable | Uso |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Cliente OAuth de Google Cloud Console. |
| `TOKEN_ENCRYPTION_KEY` | Cifra los tokens en reposo; sin ella no se conecta (503). |
| `GOOGLE_REDIRECT_URI` | Por defecto `${PUBLIC_URL}/api/google/callback` (consentimiento). El login usa `${PUBLIC_URL}/api/auth/oauth/google/callback`. |

- **Login** (`oauth-login.ts`): scopes `openid email profile`, exige email verificado, ata el `state` a una cookie HttpOnly y emite sesión. No concede acceso a Gmail/Drive.
- **Consentimiento operativo** (`google-auth.ts`): scopes de lectura de Gmail, Calendar y Drive; escritura solo a petición. El callback se valida con `state` de un solo uso + PKCE y escribe la credencial en la empresa que inició el flujo.
- Ambos `redirect_uri` deben estar registrados en el mismo cliente OAuth. `OAUTH_ALLOWED_EMAILS` sigue siendo la barandilla del login.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate: `oauth` + `vertical-slice-google-connection` | **12/12 pass, 0 fail** |
| Regresión: `auth` | **5/5 pass, 0 fail** |
| `git diff --check` | limpio |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |

Casos de `tests/vertical-slice-google-connection.test.ts`:

1. **Dos conexiones distintas**: A y B registran tenant, cuenta, autorizante y generación propios; ids y generaciones distintos; B no lee la credencial de A aunque el id de actor coincida.
2. **Mínimo privilegio**: el consentimiento de lectura no incluye `mail.google.com` ni `gmail.send`; el de escritura sí. PKCE y `access_type=offline` siguen presentes.
3. **Revocación durante el callback**: sin membership no se canjea el código (0 llamadas a Google) y no se escribe credencial.
4. **Revocación antes del refresh**: el acceso caducado falla sin pedir refresh; la desconexión posterior corta localmente igual.
5. **Credencial legacy sin atribución**: no se atribuye a la empresa (`tenantId: null`, `generation: null`); un consentimiento nuevo la atribuye.

## Pendiente declarado

- **Prueba real con dos cuentas de staging**: no ejecutada. No hay `GOOGLE_CLIENT_ID`/`SECRET` ni cuentas de staging en este entorno, así que el ciclo se acredita con `fetch` interceptado (token, profile, revoke) y store real en PGlite. El `REPORTE` no guarda secretos ni identificadores de proveedor.
- **Rotación de `state` con dos pestañas**: cubierta por CAS de generación, no por prueba de navegador.

## Rollback

Revertir el commit de la 11 devuelve `connect` al arrastre de scopes previos y elimina `connection()`/`scopes` del estado público; los campos nuevos (`tenantId`, `authorizer`, `provider`, `connectedAt`) quedan inertes en las filas existentes y no rompen la lectura. Las credenciales siguen siendo válidas: el rollback no revoca tokens.
