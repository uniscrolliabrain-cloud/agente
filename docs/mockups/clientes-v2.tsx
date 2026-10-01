// MOCKUP DE REFERENCIA — Pantalla "Clientes" (Exact Branding V2)
// No es código de producción. Es una plantilla de referencia para futuras
// iteraciones del sistema de templates dinámicos.
//
// Qué ilustra:
//   - Layout 3 columnas: sidebar izq + main card + chat lateral derecho.
//   - KPIs arriba (Total activos, Nuevos este mes, Ingresos recurrentes).
//   - Filtros pill (Todas / Mías / Activo / Pausado / Prospecto).
//   - Tabla de clientes responsive (colapsa a cards en móvil).
//   - Chat contextual a la derecha con sugerencias y acciones inline.
//
// Qué se puede reutilizar tal cual:
//   - Estructura del header del main (pill estado + buscador + Nuevo chat).
//   - KPIs con mini-barra de progreso.
//   - Filtros pill consistentes con .v2-pill.
//   - Tabla → cards responsive.
//   - Chat lateral con mensajes + sugerencias + composer.
//
// Qué hay que adaptar cuando se integre:
//   - Los datos: hoy son CLIENTES hardcodeado, deben venir de useClients() o apiFetch.
//   - El chat: debe conectar con useChat() y mandar los mensajes reales.
//   - Los filtros y search: mover a la lógica de estado real.
//   - Los botones "Ver detalle": abrir modal o navegar.

import { useState } from "react";

type Filtro = "Todas" | "Mías" | "Activo" | "Pausado" | "Prospecto";

type Cliente = {
  id: string;
  nombre: string;
  cif: string;
  email: string;
  telefono: string;
  estado: "Activo" | "Pausado" | "Prospecto";
  ingresos: string;
  inicial: string;
  responsable: "Mías" | "Otras";
};

const CLIENTES: Cliente[] = [
  { id: "1", nombre: "Talleres Martí S.L.", cif: "B-58294123", email: "compras@talleresmarti.es", telefono: "+34 933 214 087", estado: "Activo", ingresos: "3.240 €", inicial: "T", responsable: "Mías" },
  { id: "2", nombre: "Clínica Dental Norte", cif: "B-09348102", email: "admin@clinicadentalnorte.com", telefono: "+34 912 004 552", estado: "Activo", ingresos: "1.850 €", inicial: "C", responsable: "Mías" },
  { id: "3", nombre: "Estudio Lúa", cif: "B-76512309", email: "hola@estudiolua.com", telefono: "+34 622 189 340", estado: "Prospecto", ingresos: "—", inicial: "E", responsable: "Mías" },
  { id: "4", nombre: "Bodegas Vidal", cif: "A-45238911", email: "pedidos@bodegasvidal.es", telefono: "+34 958 330 120", estado: "Pausado", ingresos: "420 €", inicial: "B", responsable: "Otras" },
  { id: "5", nombre: "Nexa Logística", cif: "B-12847563", email: "operaciones@nexalog.es", telefono: "+34 936 701 298", estado: "Activo", ingresos: "5.600 €", inicial: "N", responsable: "Otras" },
  { id: "6", nombre: "Café Central", cif: "B-34129876", email: "luis@cafecentral.es", telefono: "+34 644 992 103", estado: "Activo", ingresos: "890 €", inicial: "C", responsable: "Mías" },
  { id: "7", nombre: "Reformas Sanz", cif: "B-99812344", email: "presupuestos@reformassanz.com", telefono: "+34 911 223 441", estado: "Prospecto", ingresos: "—", inicial: "R", responsable: "Otras" },
];

// [resto del componente tal cual me lo pasaste]

export default function MockupClientesV2() {
  // ... (contenido original del mockup)
  return null; // placeholder: ver archivo original completo cuando se integre
}