// WHATSAPP_OUTBOUND_CHANNEL_V1 - la respuesta sale por el canal de su empresa.
//
// Antes el panel respondia SIEMPRE con `service.whatsapp`: un unico cliente
// construido al arrancar con WHATSAPP_API_KEY / WHATSAPP_BASE_URL /
// WHATSAPP_INSTANCE del proceso. Con una sola empresa es correcto; con dos, el
// borrador de la empresa B salia por el numero de la A, o fallaba con un 502 de
// Evolution que no decia por que. El tenant de la peticion ya se conoce
// (runInTenantScope en app.ts) y el canal ya esta declarado en
// WHATSAPP_WEBHOOK_BINDINGS; lo que faltaba era unirlos.
//
// La lista de canales es configuracion de operador, nunca se deduce del
// remitente: un mensaje entrante no elige por donde se responde.

import { AppError } from "../errors.ts";
import { WhatsAppClient } from "../../../../packages/integrations/src/stubs/whatsapp.ts";
import {
  whatsappBindings,
  type WhatsAppBinding,
  type WhatsAppProvider,
} from "./whatsapp-inbound.ts";

export interface OutboundChannel {
  provider: WhatsAppProvider;
  accountId: string;
  tenantId: string;
  /** Nombre de la variable con la apikey de ESTE canal. Nunca el valor. */
  apiKeyEnv: string;
}

const DEFAULT_API_KEY_ENV = "WHATSAPP_API_KEY";

function asChannel(binding: WhatsAppBinding): OutboundChannel {
  return {
    provider: binding.provider,
    accountId: binding.accountId,
    tenantId: binding.tenantId,
    apiKeyEnv: binding.apiKeyEnv ?? DEFAULT_API_KEY_ENV,
  };
}

/** Canales provisionados para una empresa. */
export function outboundChannels(
  tenantId: string,
  bindings: WhatsAppBinding[] = whatsappBindings(),
): OutboundChannel[] {
  return bindings.map(asChannel).filter((channel) => channel.tenantId === tenantId);
}

/**
 * Canal por el que debe salir un borrador.
 *
 * - `channelId` presente: debe existir y ser de ESTA empresa. Un canal de otra
 *   empresa es un 403, no un 404: el operador tiene que saber que configuro mal
 *   el routing, no que el canal no existe.
 * - Sin `channelId`: vale solo si la empresa tiene un canal. Con dos o mas hay
 *   que decirlo explicitamente; adivinar es como se responde desde el numero
 *   equivocado.
 */
export function resolveOutboundChannel(
  tenantId: string,
  channelId?: string,
  bindings: WhatsAppBinding[] = whatsappBindings(),
): OutboundChannel {
  const all = bindings.map(asChannel);
  if (channelId) {
    const matches = all.filter((channel) => channel.accountId === channelId);
    if (matches.length === 0) {
      throw new AppError(`Canal WhatsApp ${channelId} no provisionado`, 503);
    }
    if (matches.length > 1) {
      throw new AppError(
        `Canal WhatsApp ${channelId} ambiguo entre proveedores; provisiona un id unico`,
        409,
      );
    }
    if (matches[0].tenantId !== tenantId) {
      throw new AppError("El canal del borrador pertenece a otra empresa", 403);
    }
    return matches[0];
  }
  const channels = all.filter((channel) => channel.tenantId === tenantId);
  if (channels.length === 0) {
    throw new AppError("La empresa no tiene canal de WhatsApp provisionado", 503);
  }
  if (channels.length > 1) {
    throw new AppError(
      "La empresa tiene varios canales de WhatsApp; indica channelId en el borrador",
      409,
    );
  }
  return channels[0];
}

/**
 * Cliente HTTP del canal. Solo Evolution: el cliente existente habla su API
 * (`/message/sendText/<instancia>`). Meta Cloud API tiene otra forma (graph,
 * plantillas fuera de la ventana de 24h) y no se finge soportada.
 */
export function outboundClient(channel: OutboundChannel): WhatsAppClient {
  if (channel.provider !== "evolution") {
    throw new AppError(
      "El envio por Meta Cloud API no esta implementado; usa un canal Evolution para responder",
      503,
    );
  }
  const apiKey = process.env[channel.apiKeyEnv]?.trim();
  const baseUrl = process.env.WHATSAPP_BASE_URL?.trim();
  if (!apiKey) {
    throw new AppError(`Falta ${channel.apiKeyEnv} para el canal ${channel.accountId}`, 503);
  }
  if (!baseUrl) throw new AppError("Falta WHATSAPP_BASE_URL", 503);
  return new WhatsAppClient({ apiKey, baseUrl, instance: channel.accountId });
}
