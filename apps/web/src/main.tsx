import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LegalV1 from "./components/legal/LegalV1";
import "./index.css";

// PUBLIC_ROUTES_V1 - la página legal es pública y se sirve desde el mismo build
// del panel. Las rutas antiguas .html conservan su destino mediante un redirect
// en cliente; el servidor solo necesita devolver index.html para /legal.
const LEGACY_LEGAL: Record<string, string> = {
  "/aviso-legal.html": "aviso-legal",
  "/privacidad.html": "privacidad",
  "/terminos.html": "terminos",
  "/cookies.html": "cookies",
  "/transparencia-ia.html": "transparencia-ia",
  "/confianza.html": "confianza-seguridad",
};

const rawPath = window.location.pathname.replace(/\/+$/, "") || "/";
const legacy = LEGACY_LEGAL[rawPath];
if (legacy) {
  window.history.replaceState(null, "", `/legal#${legacy}`);
}
const isLegal = rawPath === "/legal" || Boolean(legacy);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isLegal ? <LegalV1 /> : <App />}
  </React.StrictMode>
);
