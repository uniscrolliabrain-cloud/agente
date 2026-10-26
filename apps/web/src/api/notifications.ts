// NOTIF_TENANT_ENVELOPE_V1 - el endpoint /api/agent/notifications devuelve
// { tenantId, notifications } para que la UI pueda comprobar de que tenant es
// la lista. Este modulo es el unico punto que conoce ese sobre: si vuelve a
// cambiar, cambia aqui y no en cada componente.
import { apiFetch } from "./client";

export interface NotificationsEnvelope<T> {
  tenantId: string | null;
  notifications: T[];
}

export async function fetchNotifications<T>(): Promise<NotificationsEnvelope<T>> {
  const response = await apiFetch<NotificationsEnvelope<T> | T[]>("/api/agent/notifications");
  // NOTIF_ENVELOPE_COMPAT_V1 - si el server es anterior al sobre, sigue siendo
  // un array; se normaliza aqui para no romper el panel durante un despliegue
  // desacoplado (web y api se despliegan por separado).
  if (Array.isArray(response)) return { tenantId: null, notifications: response };
  return {
    tenantId: response?.tenantId ?? null,
    notifications: Array.isArray(response?.notifications) ? response.notifications : [],
  };
}
