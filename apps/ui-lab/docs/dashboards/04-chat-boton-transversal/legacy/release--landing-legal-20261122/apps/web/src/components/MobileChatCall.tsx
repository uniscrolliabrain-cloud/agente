import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Maximize2, Mic, MicOff, Phone, PhoneOff, Sparkles, Video, VideoOff } from "lucide-react";

export type MobileCallMode = "voice" | "video";

const exampleIdeas = [
  "Definir el objetivo de la conversación.",
  "Revisar el alcance con el equipo.",
  "Acordar el siguiente paso y su responsable.",
];

export interface MobileCallReport {
  id: string;
  mode: MobileCallMode;
  seconds: number;
}

interface Props {
  mode: MobileCallMode;
  initialReport?: MobileCallReport;
  onReport: (report: MobileCallReport) => void;
  onClose: () => void;
  onExpand?: () => void;
}

export default function MobileChatCall({ mode, initialReport, onReport, onClose, onExpand }: Props) {
  const [seconds, setSeconds] = useState(initialReport?.seconds ?? 0);
  const [finished, setFinished] = useState(Boolean(initialReport));
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(mode === "video");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ideas = exampleIdeas.slice(0, Math.min(exampleIdeas.length, Math.floor(seconds / 5)));
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    headingRef.current?.focus();
    if (finished) return;
    const start = performance.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((performance.now() - start) / 1000)), 250);
    return () => window.clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (!camera || finished) return;
    let cancelled = false;
    let stream: MediaStream | undefined;

    async function preview() {
      try {
        const result = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (cancelled) {
          result.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = result;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (cancelled) return;
        setCamera(false);
        setCameraError("No se pudo abrir la cámara. Revisa el permiso del navegador.");
      }
    }

    void preview();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [camera, finished]);

  const finishCall = () => {
    onReport({ id: crypto.randomUUID(), mode, seconds });
    setFinished(true);
  };

  return (
    <section className={`mobile-chat-call${videoEnabled && !finished ? " video-mode" : ""}`} aria-label="Conversación de prueba">
      <div className="mobile-call-compact">
        <div className="mobile-call-compact-status">
          {mode === "video" ? <Video size={20} aria-hidden="true" /> : <Phone size={19} aria-hidden="true" />}
          <div>
            <strong>{finished ? "Informe de la conversación" : mode === "video" ? "Videollamada con Juan" : "Llamada de voz"}</strong>
            <span>{finished ? "Sesión finalizada" : `En curso · ${time}`}</span>
          </div>
        </div>
        <button type="button" aria-label={finished ? "Ampliar informe" : "Ampliar llamada"} onClick={() => {
          onExpand?.();
          headingRef.current?.focus({ preventScroll: true });
        }}><Maximize2 size={18} aria-hidden="true" /></button>
        <button
          type="button"
          className={finished ? undefined : "end-call"}
          aria-label={finished ? "Volver al chat" : "Finalizar llamada"}
          onClick={finished ? onClose : finishCall}
        >
          {finished ? <ArrowLeft size={19} aria-hidden="true" /> : <PhoneOff size={19} aria-hidden="true" />}
        </button>
      </div>
      <header>
        <h2 ref={headingRef} tabIndex={-1}>{finished ? "Informe de la conversación" : mode === "video" ? "Hablar con Juan · Finanzas" : "Conversación por voz"}</h2>
        <p>{mode === "video" && !finished ? "Videollamada demo" : "Simulación"} · {time}</p>
      </header>
      {!finished && mode === "video" && (
        <label className="mobile-call-toggle">
          <input
            type="checkbox"
            role="switch"
            checked={videoEnabled}
            onChange={(event) => {
              setVideoEnabled(event.target.checked);
              if (!event.target.checked) setCamera(false);
            }}
          />
          Mostrar vista de vídeo
        </label>
      )}
      {!finished && (
        <div className="mobile-call-stage">
          {videoEnabled ? (
            <>
              <img className="mobile-call-portrait" src="/images/juan-finanzas-demo.webp" alt="Retrato de Juan, agente demo de Finanzas" />
              <div className="mobile-call-portrait-veil" aria-hidden="true" />
            </>
          ) : (
            <div className="mobile-call-agent"><Sparkles size={30} aria-hidden="true" /><span>Tu agente</span></div>
          )}
          {videoEnabled && (
            <div className="mobile-call-self">
              {camera ? <video ref={videoRef} autoPlay muted playsInline aria-label="Vista previa local" /> : <Camera size={22} aria-hidden="true" />}
              <span>Tú</span>
            </div>
          )}
        </div>
      )}
      <div className="mobile-call-ideas" aria-live="polite">
        <h3>{finished ? "Puntos de ejemplo" : "Ideas destacadas"}</h3>
        {ideas.length ? <ul>{ideas.map((idea) => <li key={idea}>{idea}</li>)}</ul> : <p>{finished ? "La sesión terminó antes de que aparecieran ideas." : "Las ideas de ejemplo aparecerán durante la conversación."}</p>}
        {finished && ideas.length > 0 && <p><strong>Siguiente paso de ejemplo.</strong> Confirmar con el equipo qué acción va primero.</p>}
      </div>
      {cameraError && !finished && <p role="status">{cameraError}</p>}
      <footer>
        {finished ? (
          <button type="button" onClick={onClose}><ArrowLeft size={18} /> Volver al chat</button>
        ) : (
          <>
            <button type="button" aria-pressed={muted} aria-label={muted ? "Activar micrófono" : "Silenciar micrófono"} onClick={() => setMuted(!muted)}>
              {muted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            {videoEnabled && (
              <button type="button" aria-pressed={camera} aria-label={camera ? "Apagar cámara" : "Encender cámara local"} onClick={() => { setCameraError(""); setCamera(!camera); }}>
                {camera ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            )}
            <button className="end-call" type="button" onClick={finishCall}><PhoneOff size={19} /> Finalizar</button>
          </>
        )}
      </footer>
    </section>
  );
}
