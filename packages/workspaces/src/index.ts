// WORKSPACES_BARREL_V1 - punto de entrada del paquete @openmuse/workspaces.

export * from "./contracts/index.ts";

import { workspace as ws_01_gmail } from "./01-gmail/src/index.ts";
import { workspace as ws_02_whatsapp } from "./02-whatsapp/src/index.ts";
import { workspace as ws_03_hubspot } from "./03-hubspot/src/index.ts";
import { workspace as ws_04_holded } from "./04-holded/src/index.ts";
import { workspace as ws_05_google_drive } from "./05-google-drive/src/index.ts";
import { workspace as ws_06_google_calendar } from "./06-google-calendar/src/index.ts";
import { workspace as ws_07_linear } from "./07-linear/src/index.ts";
import { workspace as ws_08_chatgpt } from "./08-chatgpt/src/index.ts";
import { workspace as ws_09_airtable } from "./09-airtable/src/index.ts";
import { workspace as ws_10_perdoo } from "./10-perdoo/src/index.ts";
import { workspace as ws_11_holded_tesoreria } from "./11-holded-tesoreria/src/index.ts";
import { workspace as ws_12_odoo_purchase } from "./12-odoo-purchase/src/index.ts";
import { workspace as ws_13_productive } from "./13-productive/src/index.ts";
import { workspace as ws_14_zendesk } from "./14-zendesk/src/index.ts";
import { workspace as ws_15_docusign } from "./15-docusign/src/index.ts";
import { workspace as ws_16_n8n } from "./16-n8n/src/index.ts";
import { workspace as ws_17_process_street } from "./17-process-street/src/index.ts";
import { workspace as ws_18_factorial } from "./18-factorial/src/index.ts";
import { workspace as ws_19_personio } from "./19-personio/src/index.ts";
import { workspace as ws_20_ramp } from "./20-ramp/src/index.ts";
import { workspace as ws_21_stripe } from "./21-stripe/src/index.ts";
import { workspace as ws_22_canva } from "./22-canva/src/index.ts";
import { workspace as ws_23_buffer } from "./23-buffer/src/index.ts";
import { workspace as ws_24_shopify } from "./24-shopify/src/index.ts";
import { workspace as ws_25_intercom } from "./25-intercom/src/index.ts";
import { workspace as ws_26_odoo_inventory } from "./26-odoo-inventory/src/index.ts";
import { workspace as ws_27_maintainx } from "./27-maintainx/src/index.ts";
import { workspace as ws_28_odoo_manufacturing } from "./28-odoo-manufacturing/src/index.ts";
import { workspace as ws_29_isms_online } from "./29-isms-online/src/index.ts";
import { workspace as ws_30_microsoft_entra } from "./30-microsoft-entra/src/index.ts";
import { workspace as ws_31_suitedash } from "./31-suitedash/src/index.ts";
import { workspace as ws_32_notion } from "./32-notion/src/index.ts";
import { workspace as ws_33_langsmith } from "./33-langsmith/src/index.ts";
import { workspace as ws_34_trello } from "./34-trello/src/index.ts";
export const ALL_WORKSPACES = [
  ws_01_gmail,
  ws_02_whatsapp,
  ws_03_hubspot,
  ws_04_holded,
  ws_05_google_drive,
  ws_06_google_calendar,
  ws_07_linear,
  ws_08_chatgpt,
  ws_09_airtable,
  ws_10_perdoo,
  ws_11_holded_tesoreria,
  ws_12_odoo_purchase,
  ws_13_productive,
  ws_14_zendesk,
  ws_15_docusign,
  ws_16_n8n,
  ws_17_process_street,
  ws_18_factorial,
  ws_19_personio,
  ws_20_ramp,
  ws_21_stripe,
  ws_22_canva,
  ws_23_buffer,
  ws_24_shopify,
  ws_25_intercom,
  ws_26_odoo_inventory,
  ws_27_maintainx,
  ws_28_odoo_manufacturing,
  ws_29_isms_online,
  ws_30_microsoft_entra,
  ws_31_suitedash,
  ws_32_notion,
  ws_33_langsmith,
  ws_34_trello,
] as const;
