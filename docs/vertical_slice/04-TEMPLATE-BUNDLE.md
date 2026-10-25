# 04 — Template del tenant (concreto, no genérico)

> El template es **para ti**. Tú lo compilas manualmente para cada cliente. El cliente no ve el template, ve su instancia. Cada cliente es un tenant. El template no es genérico: es el bundle exacto de una agencia de IA que vende asistente multi-canal a pymes.

## Modelo

- **Tú** eres el owner de la plataforma. Tienes un usuario en Supabase (`owner@tuagencia.com`).
- **Cada cliente** es un tenant. Tiene un `tenant_id` (ej. `piloto-gestoria`).
- **Cada cliente** entra con su Google OAuth. Supabase le crea `user_id`. Tú insertas `(user_id, tenant_id)` en `user_tenants`.
- **Tú compilas** el tenant desde `clientes/_template/` con `provision-client.ts`. 1 comando.
- **El cliente** ve su instancia: chat, leads, citas, conversaciones. No ve el template, no ve otros tenants.

## Bundle exacto del template

`clientes/_template/bundle.json`:

```json
{
  "version": "1.0.0",
  "tenantId": "${TENANT_ID}",
  "company": {
    "name": "${COMPANY_NAME}",
    "sector": "${SECTOR}",
    "description": "${COMPANY_DESCRIPTION}",
    "services": ${SERVICES_JSON},
    "timezone": "${TIMEZONE}",
    "language": "es"
  },
  "channels": {
    "chat": { "enabled": true },
    "whatsapp": {
      "enabled": true,
      "provider": "cloud-api",
      "phoneNumberId": "${WHATSAPP_PHONE_NUMBER_ID}",
      "accessToken": "${WHATSAPP_ACCESS_TOKEN}",
      "verifyToken": "${WHATSAPP_VERIFY_TOKEN}"
    },
    "telephony": {
      "enabled": false,
      "provider": "twilio",
      "accountSid": "${TWILIO_ACCOUNT_SID}",
      "authToken": "${TWILIO_AUTH_TOKEN}",
      "phoneNumber": "${TWILIO_PHONE_NUMBER}",
      "ttsVoice": "es-ES-Neural2-A"
    },
    "email": {
      "enabled": true,
      "provider": "gmail",
      "oauthConnectionId": "${GMAIL_CONNECTION_ID}"
    }
  },
  "agents": [
    {
      "id": "atencion",
      "name": "${AGENT_NAME}",
      "tone": "warm",
      "avatar": "sky",
      "objetivo": "Atender leads por WhatsApp, email y telefono. Cualificar, agendar cita si procede, responder con la data de la empresa, crear briefing interno.",
      "sops": ["responder-lead"],
      "allowedTools": [
        "search_mail", "read_mail_thread", "prepare_email",
        "prepare_event", "search_drive_files", "read_drive_file",
        "query_business", "transition_entity", "prepare_whatsapp",
        "create_briefing", "lead.search", "lead.create",
        "lead.update", "appointment.create", "ask_user"
      ],
      "memories": [
        { "kind": "identidad", "text": "Eres ${AGENT_NAME}, asistente de ${COMPANY_NAME}. Tuteas, eres cercano, resuelves." },
        { "kind": "dominio", "text": "${COMPANY_DESCRIPTION}. Servicios: ${SERVICES_TEXT}." },
        { "kind": "preferencias", "text": "Responde en menos de 3 frases. Si el lead pide cita, agenda. Si no sabes algo, dilo y ofrece hablar con un humano." },
        { "kind": "historial", "text": "Los leads que llegan por WhatsApp suelen pedir presupuesto. Los que llegan por email suelen pedir informacion." }
      ]
    }
  ],
  "processes": [
    {
      "id": "responder-lead",
      "name": "Responder lead",
      "sopFile": "sops/responder-lead.json",
      "triggers": [
        { "type": "whatsapp_message" },
        { "type": "email_subject", "value": "presupuesto|informacion|consulta|cita" },
        { "type": "telephony_incoming" }
      ]
    }
  ],
  "capabilities": {
    "disabled": [],
    "enabled": [
      "read_mail_thread", "search_mail", "prepare_email",
      "prepare_event", "search_drive_files", "read_drive_file",
      "query_business", "transition_entity", "prepare_whatsapp",
      "create_briefing", "lead.search", "lead.create",
      "lead.update", "appointment.create", "ask_user"
    ]
  },
  "config": {
    "fast": { "provider": "google", "model": "gemini-2.0-flash" },
    "slow": { "provider": "google", "model": "gemini-2.0-flash" },
    "maxSteps": 6,
    "quota": {
      "tokensPerDay": 1000000,
      "costEurPerDay": 20,
      "fastCallsPerHour": 1000,
      "slowCallsPerHour": 500
    }
  },
  "crm": {
    "kind": "sheets",
    "spreadsheetId": "${SHEETS_SPREADSHEET_ID}",
    "leadsSheet": "Leads",
    "appointmentsSheet": "Citas"
  }
}
```

## Placeholders (lo que sustituyes tú al compilar)

| Placeholder | Ejemplo | De dónde sale |
|---|---|---|
| `${TENANT_ID}` | `piloto-gestoria` | Lo eliges tú |
| `${COMPANY_NAME}` | `Gestoria Perez` | El cliente |
| `${SECTOR}` | `gestoria` | El cliente |
| `${COMPANY_DESCRIPTION}` | `Gestoria fiscal y laboral para pymes` | El cliente |
| `${SERVICES_JSON}` | `["declaraciones","nominas","asesoria"]` | El cliente |
| `${SERVICES_TEXT}` | `declaraciones, nominas, asesoria` | El cliente |
| `${TIMEZONE}` | `Europe/Madrid` | El cliente |
| `${AGENT_NAME}` | `Ana` | Lo eliges tú |
| `${WHATSAPP_PHONE_NUMBER_ID}` | `123456` | Meta Business |
| `${WHATSAPP_ACCESS_TOKEN}` | `EAAG...` | Meta Business |
| `${WHATSAPP_VERIFY_TOKEN}` | `abc123` | Lo generas tú |
| `${TWILIO_ACCOUNT_SID}` | `AC...` | Twilio |
| `${TWILIO_AUTH_TOKEN}` | `...` | Twilio |
| `${TWILIO_PHONE_NUMBER}` | `+34...` | Twilio |
| `${GMAIL_CONNECTION_ID}` | `conn-1` | OAuth del cliente |
| `${SHEETS_SPREADSHEET_ID}` | `1abc...` | Google Sheets del cliente |