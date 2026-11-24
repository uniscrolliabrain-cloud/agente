// CHAT_UX_V2_PREVIEW - preview aislada y explicita. Parametros solo de QA:
//   ?state=home|conversation|long|streaming
//   ?role=legal|finanzas|comercial|marketing
//   ?container=320..1200   (ancho del contenedor; simula el panel transversal)
// No hay llamadas de red, ni acciones reales, ni persistencia.

import ChatPanelUX from "./ChatPanelUX";
import { ChatUXFrame } from "./ChatUXFrame";
import { type FixtureState, fixtureUpload, fixtureUserName } from "./fixture";
import { useChatFixture } from "./useChatFixture";

const STATES: FixtureState[] = ["home", "conversation", "long", "streaming"];

function readState(value: string | null): FixtureState {
  return STATES.includes(value as FixtureState) ? (value as FixtureState) : "home";
}

function readContainer(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 320 || parsed > 1200) return null;
  return Math.round(parsed);
}

export default function ChatUXV2Preview() {
  const params = new URLSearchParams(location.search);
  const state = readState(params.get("state"));
  const container = readContainer(params.get("container"));
  const chat = useChatFixture(state, params.get("role") ?? undefined);

  const panel = <ChatPanelUX chat={chat} userName={fixtureUserName} upload={fixtureUpload} />;

  if (container) {
    return (
      <div className="cux-host cux-host--constrained">
        <div className="cux-constraint" style={{ width: container }} data-container-width={container}>
          <ChatUXFrame>{panel}</ChatUXFrame>
        </div>
      </div>
    );
  }

  return (
    <div className="cux-host">
      <ChatUXFrame>{panel}</ChatUXFrame>
    </div>
  );
}
