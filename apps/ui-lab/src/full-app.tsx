import { StrictMode, lazy, Suspense, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { demoUser } from "../../web/src/demo/fixtures";
import { DEMO_TOKEN } from "../../web/src/demo/tenant";
import type { AppView } from "../../web/src/components/SidebarV2";
import "../../web/src/index.css";
import "./clone-views.css";

// FULL_APP_DEMO_V1 - clon navegable de la aplicación real.
// Monta apps/web/src/App tal cual y activa la sesión demo: api/client responde
// desde demo/router en el navegador, sin backend y sin tocar datos reales.
// No importa `safety.ts`: el demo no hace red, pero necesita su propio router.
//
// DEMO_VIEWS_V1 - los workspaces nuevos (UI Lab V1/V3/V4) entran en el clon por
// el mapa `demoViews` de App. Producción no los recibe: allí el prop va vacío.
const RealApp = lazy(() => import("../../web/src/App"));
const KnowledgeWorkspace = lazy(() => import("./knowledge-v1/KnowledgeWorkspace"));
const DocumentsExplorer = lazy(() => import("./documents-explorer/DocumentsExplorer"));
const ComunicacionesWorkspace = lazy(() => import("./comunicaciones/ComunicacionesWorkspace"));
const AppsLauncher = lazy(() => import("./apps-launcher/AppsLauncher"));
const FormationV4 = lazy(() => import("./formation-v4/FormationV4Workspace"));
const LegalV1 = lazy(() => import("./legal/LegalV1"));

function View({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<p style={{ padding: 24, color: "var(--text-2, #6b7280)" }}>Preparando la vista…</p>}
    >
      {children}
    </Suspense>
  );
}

const demoViews = {
  // NAV_KNOWLEDGE_V1 - recibe la navegación del shell para que su menú general
  // cambie de vista de verdad en lugar de dejar los botones muertos.
  memory: (nav: (view: AppView) => void) => (
    <View>
      <KnowledgeWorkspace onNavigate={nav} />
    </View>
  ),
  documents: (
    <View>
      <DocumentsExplorer />
    </View>
  ),
  whatsapp: (
    <View>
      <ComunicacionesWorkspace />
    </View>
  ),
  apps: (
    <View>
      <AppsLauncher />
    </View>
  ),
  formation: (
    <View>
      <FormationV4 />
    </View>
  ),
};

// Sin sesión, App decide entre landing y login. El clon siembra la demo para
// entrar directo al panel; la landing/login siguen alcanzables al salir.
localStorage.setItem("agente_auth", JSON.stringify({ token: DEMO_TOKEN, mode: "sample" }));
localStorage.setItem("agente_user", JSON.stringify(demoUser));

const isLegal = /\/legal\/?$/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div style={{ padding: 32 }}>Preparando la aplicación en modo demo…</div>}>
      {isLegal ? <LegalV1 /> : <RealApp demoViews={demoViews} />}
    </Suspense>
  </StrictMode>,
);
