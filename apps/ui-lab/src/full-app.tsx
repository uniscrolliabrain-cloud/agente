import { StrictMode, lazy, Suspense, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { demoUser } from "../../web/src/demo/fixtures";
import { initAccent } from "../../web/src/lib/accent";
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
// TU_EMPRESA_V1 - meta-app del clon: se abre desde Ajustes y tapa el shell.
const CompanyApp = lazy(() => import("./company-v2/CompanyApp"));
// AGNTIA_CODE_V1 - plataforma de IA coding del clon, con su propio shell.
const CodeApp = lazy(() => import("./code-v1/CodeApp"));

function View({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<p style={{ padding: 24, color: "var(--text-2, #6b7280)" }}>Preparando la vista…</p>}
    >
      {children}
    </Suspense>
  );
}

const TasksAutomationsWorkspace = lazy(() => import("./tasks-automations-v1/TasksAutomationsWorkspace"));

const TeamWorkspace = lazy(() => import("./team-v1/TeamWorkspace"));

const AnalyticsWorkspace = lazy(() => import("./analytics-v1/AnalyticsWorkspace"));

// CARTERA_DEMO_V1 - Cartera ocupa la entrada Proyectos del menú: es el mismo
// puesto de trabajo, con la cartera V2 en lugar de la vista antigua.
const PortfolioWorkspace = lazy(() => import("./cartera-v1/PortfolioWorkspace"));

const demoViews = {
  "centro-mando": <View><AnalyticsWorkspace /></View>,
  projects: (
    <View>
      <PortfolioWorkspace />
    </View>
  ),
  team: (nav: (view: AppView) => void) => <View><TeamWorkspace onNavigate={nav} /></View>,
  tasks: <View><TasksAutomationsWorkspace /></View>,
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

// APARIENCIA_V1 - el color elegido en el perfil se aplica antes del primer
// pintado para que la banda no cambie de color al abrir la vista.
initAccent();

// Sin sesión, App decide entre landing y login. El clon siembra la demo para
// entrar directo al panel; la landing/login siguen alcanzables al salir.
localStorage.setItem("agente_auth", JSON.stringify({ token: DEMO_TOKEN, mode: "sample" }));
localStorage.setItem("agente_user", JSON.stringify(demoUser));

const isLegal = /\/legal\/?$/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div style={{ padding: 32 }}>Preparando la aplicación en modo demo…</div>}>
      {isLegal ? (
        <LegalV1 />
      ) : (
        <RealApp
          demoViews={demoViews}
          companyArea={({ onClose }) => (
            <View>
              <CompanyApp onClose={onClose} />
            </View>
          )}
          codeArea={({ onClose }) => (
            <View>
              <CodeApp onClose={onClose} />
            </View>
          )}
        />
      )}
    </Suspense>
  </StrictMode>,
);
