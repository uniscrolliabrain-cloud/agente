# Deploy por cliente

Un deployment por cliente. Nunca multitenancy. Pasos:

1. Clonar repo en el host.
2. Configurar .env:
   - WORKSPACE_MODE=live
   - ADMIN_EMAIL / ADMIN_PASSWORD
   - OPENMUSE_ACCESS_KEY (24+ chars)
   - TOKEN_ENCRYPTION_KEY (32-byte base64)
   - GEMINI_API_KEY
   - DATABASE_URL
   - ALLOWED_ORIGINS
   - OPENMUSE_PROCESS_ROLE=api (si worker en otro proceso)
3. pnpm install
4. pnpm build:server
5. pnpm migrate:tenant-scope (una vez)
6. pnpm admin:create
7. Arrancar API + worker (o all).
8. Verificar /api/health-deep en 200.
9. Verificar /api/admin/system/status.
10. Provisionar clientes:
    pnpm provision-client clientes/<nombre>
11. Verificar /api/admin/tenants/<tenantId>/onboarding.
12. Entregar credenciales al cliente + docs/CLIENTE.md.

Backup: BACKUP_INTERVAL_HOURS=24, BACKUP_RETENTION_DAYS=7.
Restore: pnpm backup:restore --from <dir>.