// CONFERENCE_ROOM_V1 - sala de videoconferencia interna (estilo WhatsApp/Zoom).
//
// Scaffold funcional sin dependencias nuevas: rejilla de participantes, tile
// del avatar, transcripcion en vivo, mute, colgar e interrumpir. El video real
// de Anam se monta en `videoRef` desde el SDK cuando exista ANAM_API_KEY; hoy
// el tile muestra el retrato generado y el estado de la sesion.
//
// No asume ningun router: se monta como overlay a pantalla completa.

import { useEffect, useMemo, useRef, useState } from "react";
import { useAvatarCall, type AvatarAgent } from "./useAvatarCall";

interface ConferenceRoomProps {
  /** Si no se pasan, se piden a /api/avatar/agents (el panel se autosirve). */
  agents?: AvatarAgent[];
  initialAgentId?: string;
  onClose?: () => void;
}

export default function ConferenceRoom({
  agents: initialAgents,
  initialAgentId,
  onClose,
}: ConferenceRoomProps) {
  const [agents, setAgents] = useState<AvatarAgent[]>(initialAgents ?? []);
  const [selected, setSelected] = useState(initialAgentId ?? initialAgents?.[0]?.agentId ?? "laia");
  const [muted, setMuted] = useState(true);
  const [draft, setDraft] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const agent = useMemo(
    () => agents.find((entry) => entry.agentId === selected) ?? agents[0],
    [agents, selected],
  );

  const call = useAvatarCall({ agentId: selected });
  const startedRef = useRef(false);

  // El panel de llamadas se sirve su propia lista: montarlo no obliga a tocar
  // el shell ni a precargar nada.
  useEffect(() => {
    if (initialAgents && initialAgents.length > 0) return;
    let cancelled = false;
    void fetch("/api/avatar/agents")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { agents?: AvatarAgent[] } | null) => {
        if (!cancelled && payload?.agents?.length) setAgents(payload.agents);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [initialAgents]);

  // VOICE_ROOM_AUTOSTART_V1 - una sola apertura de sesion; `call` es un objeto
  // nuevo en cada render, asi que no puede ir en las dependencias.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void call.start();
  }, [call.start]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (muted) setMuted(false);
    await call.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              call.state === "live"
                ? "bg-emerald-400"
                : call.state === "error"
                  ? "bg-red-500"
                  : "bg-amber-400"
            }`}
          />
          <div>
            <p className="text-sm font-medium">{agent?.displayName ?? "Sin agente"}</p>
            <p className="text-xs text-neutral-400">
              {agent?.role ?? ""} · {call.state}
              {call.session ? ` · turno ${call.session.turns}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md bg-neutral-800 px-2 py-1 text-xs"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            disabled={call.state === "live"}
          >
            {agents.map((entry) => (
              <option key={entry.agentId} value={entry.agentId}>
                {entry.displayName}
              </option>
            ))}
          </select>
          <button
            className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs"
            onClick={() => (muted ? setMuted(false) : setMuted(true))}
          >
            {muted ? "Activar micro" : "Silenciar"}
          </button>
          <button
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium"
            onClick={async () => {
              await call.stop();
              onClose?.();
            }}
          >
            Colgar
          </button>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[2fr_1fr]">
        <section className="relative overflow-hidden rounded-xl bg-neutral-900">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full text-2xl font-semibold"
              style={{ background: `hsl(${hash(selected) % 360} 45% 32%)` }}
            >
              {(agent?.displayName ?? "?").slice(0, 1)}
            </div>
            <p className="text-xs text-neutral-400">
              {agent?.avatar.configured ? "Avatar Anam conectado" : "Avatar sin configurar (ANAM_API_KEY)"}
            </p>
          </div>
          {call.error ? (
            <p className="absolute bottom-3 left-3 right-3 rounded-md bg-red-950/80 px-3 py-2 text-xs text-red-200">
              {call.error}
            </p>
          ) : null}
        </section>

        <aside className="flex flex-col gap-3 overflow-hidden">
          <div className="flex-1 overflow-y-auto rounded-xl bg-neutral-900 p-3 text-sm leading-relaxed">
            {call.transcript || (
              <p className="text-xs text-neutral-500">
                La transcripcion aparece aqui. Se envia al TTS por frases, no al terminar el turno.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-md bg-neutral-800 px-3 py-2 text-sm outline-none"
              placeholder={muted ? "Micro silenciado: escribe o activalo" : "Habla o escribe"}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void send();
              }}
            />
            <button
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium"
              onClick={() => void send()}
            >
              Enviar
            </button>
            <button
              className="rounded-md bg-neutral-800 px-3 py-2 text-sm"
              onClick={() => void call.interrupt()}
              title="Cortar al agente (barge-in)"
            >
              Cortar
            </button>
          </div>
        </aside>
      </main>

      <footer className="border-t border-neutral-800 px-4 py-2 text-[11px] text-neutral-500">
        Sesion de voz con aislamiento por empresa · el audio no se transcodifica en el servidor
      </footer>
    </div>
  );
}

function hash(value: string): number {
  let out = 0;
  for (let i = 0; i < value.length; i += 1) out = (out * 31 + value.charCodeAt(i)) >>> 0;
  return out;
}
