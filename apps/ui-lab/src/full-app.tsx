import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { demoUser } from "../../web/src/demo/fixtures";
import { DEMO_TOKEN } from "../../web/src/demo/tenant";
import "../../web/src/index.css";

// FULL_APP_DEMO_V1 - clon navegable de la aplicación real.
// Monta apps/web/src/App tal cual y activa la sesión demo: api/client responde
// desde demo/router en el navegador, sin backend y sin tocar datos reales.
// No importa `safety.ts`: el demo no hace red, pero necesita su propio router.
const RealApp = lazy(() => import("../../web/src/App"));

localStorage.setItem("agente_auth", JSON.stringify({ token: DEMO_TOKEN, mode: "sample" }));
localStorage.setItem("agente_user", JSON.stringify(demoUser));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div style={{ padding: 32 }}>Preparando la aplicación en modo demo…</div>}>
      <RealApp />
    </Suspense>
  </StrictMode>,
);
