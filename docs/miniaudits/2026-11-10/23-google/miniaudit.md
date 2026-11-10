# Bloque 23 · Google

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 4 · S2 6 · S3 3)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | El scope de escritura es acceso total: `mail.google.com` y `auth/drive` (leer, escribir, borrar y compartir). | Sin verificar |
| 2 | S1 | `assertMembership` retorna en silencio si no se inyecta `checks.membership`. | Sin verificar |
| 3 | S1 | El refresh descarta el `refresh_token` nuevo si Google lo devuelve. | Sin verificar |
| 4 | S1 | El single-flight del refresh es por proceso: API y worker compiten y uno recibe 409. | Sin verificar |
| 5 | S2 | El callback exige la Gmail API incluso para conectar sólo Drive o Calendar. | Sin verificar |
| 6 | S2 | El `state` de OAuth vive bajo `owner: "system"`, fuera del scope de tenant y del backup por tenant. | Sin verificar |
| 7 | S2 | `include_granted_scopes=true` con `prompt=consent` en cada conexión: reconectar no degrada scopes. | Sin verificar |
| 8 | S2 | La comprobación de scope compara la cadena exacta: un `drive.file` concedido falla como si no hubiera permiso. | Sin verificar |
| 9 | S2 | `email.send` no suma el tamaño de los adjuntos; el tope es el `bodyLimit` de 12 MB. | Sin verificar |
| 10 | S2 | Una credencial legacy sin empresa se acepta como conexión válida y no se policía. | Sin verificar |
| 11 | S3 | Desconectar con revocación fallida lanza 502 aunque la desconexión local ya ocurrió. | Sin verificar |
| 12 | S3 | `accessToken` no comprueba que el usuario siga existiendo. | Sin verificar |
| 13 | S3 | El redirect se deriva de `PUBLIC_API_URL` sin validar contra Google: el error real se pierde. | Sin verificar |

## Arreglos propuestos

1. **Scopes mínimos**: `gmail.send` en vez de `mail.google.com`; `drive.file` en vez de `auth/drive`. El acceso total convierte un bug en una pérdida de datos del cliente.
2. **`assertMembership` que falle** si no hay comprobador: un guard que retorna en silencio cuando no está cableado no protege nada.
3. **Persistir el `refresh_token` nuevo** y hacer el single-flight compartido (tabla/Redis), no por proceso.
4. **`state` por tenant y con nonce**, no bajo `owner: "system"`: hoy queda fuera del aislamiento y del backup por empresa.
5. **Comparar scopes por conjunto**, no por cadena exacta: `drive.file` concedido no puede interpretarse como "sin permiso".

## Plan

- **P1 (permisos)**: scopes mínimos, `assertMembership` obligatorio, comparación por conjunto.
- **P2 (tokens)**: refresh con rotación y single-flight compartido; `accessToken` con usuario vivo.
- **P3 (conexión)**: `state` tenant-scoped con nonce y caducidad; revocación sin 502 tras desconexión local.

---

## Revisión de destino

El producto pide "Gmail, Drive, WhatsApp, Calendar" por empresa, y el informe de secretos ya recomienda scopes mínimos. Faltan:

- `gmail.send` y `drive.file` en vez de acceso total.
- Refresh con rotación y single-flight compartido.
- `state` por tenant con nonce (hoy `owner: "system"`).
- Comparación de scopes por conjunto.

## Conclusión

Pedir acceso total al correo y al Drive de un cliente es un riesgo que no se justifica por comodidad: es la primera objeción de cualquier compra. **P0** los scopes y el `state`; **P1** el resto.
