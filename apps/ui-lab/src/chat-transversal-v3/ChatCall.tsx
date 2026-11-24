// CHAT_TRANSVERSAL_V3 — conversación por voz y videollamada de demostración.
// La sesión, el tiempo y las ideas son simulados; la cámara propia sí es real y
// se libera al apagarla, al finalizar y al desmontar.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CameraOff, Maximize2, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { BrandMark } from "../../../web/src/components/BrandMark";
import { CALL_IDEAS, formatDuration, LAIA_PORTRAIT, NEXT_STEP, type CallMode, type CallReport } from "./chat-data";

const IDEA_EVERY_SECONDS = 6;
const MIN_SECONDS_FOR_IDEAS = 3;

interface Props {
  mode: CallMode;
  report?: CallReport;
  compact?: boolean;
  onReport: (report: CallReport) => void;
  onClose: () => void;
  onExpand?: () => void;
}

export default function ChatCall({ mode, report, compact = false, onReport, onClose, onExpand }: Props) {
  const [seconds, setSeconds] = useState(report?.seconds ?? 0);
  const [finished, setFinished] = useState(Boolean(report));
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(mode === "video");
  const [cameraError, setCameraError] = useState("");
  const [liveIdeas, setLiveIdeas] = useState<string[]>(report?.ideas ?? []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const ideas = finished ? (report?.ideas ?? liveIdeas) : liveIdeas;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (finished) return;
    const start = performance.now() - seconds * 1000;
    const timer = window.setInterval(() => {
      setSeconds(Math.floor((performance.now() - start) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
    // Solo depende de finished: reiniciar el temporizador al pausar sería un bug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  useEffect(() => {
    if (finished) return;
    setLiveIdeas(CALL_IDEAS.slice(0, Math.min(CALL_IDEAS.length, Math.floor(seconds / IDEA_EVERY_SECONDS))));
  }, [seconds, finished]);

  useEffect(() => {
    if (!camera || finished) return;
    let cancelled = false;
    let stream: MediaStream | undefined;

    async function preview() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("sin soporte");
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
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [camera, finished]);

  const finish = () => {
    const generated = Math.floor(seconds / IDEA_EVERY_SECONDS);
    const finalIdeas =
      seconds >= MIN_SECONDS_FOR_IDEAS ? CALL_IDEAS.slice(0, Math.min(CALL_IDEAS.length, generated || 1)) : [];
    const next: CallReport = { id: `${mode}-${Date.now()}`, mode, seconds, ideas: finalIdeas };
    setCamera(false);
    setFinished(true);
    setLiveIdeas(finalIdeas);
    onReport(next);
  };

  const title = finished
    ? "Acta de la conversación"
    : mode === "video"
      ? "Videollamada con LAIA"
      : "Conversación por voz";

  if (compact && !finished) {
    return (
      <div className="ctv-call-compact">
        <span className="ctv-call-compact-icon" aria-hidden="true">
          {mode === "video" ? <Video size={18} /> : <BrandMark size={18} />}
        </span>
        <div className="ctv-call-compact-text">
          <strong>{mode === "video" ? "Videollamada · simulación" : "Voz · simulación"}</strong>
          <span>{formatDuration(seconds)}</span>
        </div>
        <button
          type="button"
          className="ctv-icon-button"
          aria-label={finished ? "Ampliar acta" : "Ampliar la conversación"}
          onClick={() => {
            onExpand?.();
            headingRef.current?.focus({ preventScroll: true });
          }}
        >
          <Maximize2 size={17} aria-hidden="true" />
        </button>
        <button type="button" className="ctv-call-end" aria-label="Finalizar" onClick={finish}>
          <PhoneOff size={17} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <section className="ctv-call ctv-report" aria-label="Acta de la conversación">
        <header className="ctv-report-head">
          <p className="ctv-report-eyebrow">Demostración · sesión simulada</p>
          <h2 ref={headingRef} tabIndex={-1}>{title}</h2>
          <dl className="ctv-report-meta">
            <div>
              <dt>Modalidad</dt>
              <dd>{mode === "video" ? "Videollamada" : "Voz"}</dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>{formatDuration(seconds)}</dd>
            </div>
            <div>
              <dt>Puntos</dt>
              <dd>{ideas.length}</dd>
            </div>
          </dl>
        </header>

        <div className="ctv-report-body">
          {ideas.length ? (
            <>
              <h3>Puntos destacados</h3>
              <ol className="ctv-report-points">
                {ideas.map((idea, index) => (
                  <li key={idea}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <p>{idea}</p>
                  </li>
                ))}
              </ol>
              <div className="ctv-report-next">
                <h3>Siguiente paso</h3>
                <p>{NEXT_STEP}</p>
              </div>
            </>
          ) : (
            <div className="ctv-report-empty">
              <p>La sesión terminó antes de que aparecieran ideas.</p>
              <p>No hay acta que redactar: vuelve al chat cuando quieras retomarlo.</p>
            </div>
          )}
        </div>

        <footer className="ctv-report-foot">
          <button type="button" className="ctv-primary" onClick={onClose}>
            <ArrowLeft size={17} aria-hidden="true" /> Volver al chat
          </button>
          <p>Contenido sintético para revisar la experiencia. No hay reunión real.</p>
        </footer>
      </section>
    );
  }

  return (
    <section className={`ctv-call ctv-call--${mode}${videoEnabled ? " is-video" : ""}`} aria-label="Conversación de demostración">
      <header className="ctv-call-head">
        <p className="ctv-call-eyebrow">{mode === "video" ? "Videollamada · simulación" : "Voz · simulación"}</p>
        <h2 ref={headingRef} tabIndex={-1}>{title}</h2>
        <p className="ctv-call-timer" aria-live="off">{formatDuration(seconds)}</p>
      </header>

      {mode === "video" && videoEnabled ? (
        <div className="ctv-video-stage">
          <img className="ctv-video-portrait" src={LAIA_PORTRAIT} alt="LAIA en una videollamada de demostración" />
          <div className="ctv-video-veil" aria-hidden="true" />
          <span className="ctv-video-badge">Retrato de LAIA · fotografía real, vídeo simulado</span>
          <div className={`ctv-pip${camera ? " is-live" : ""}`}>
            {camera ? (
              <video ref={videoRef} autoPlay muted playsInline aria-label="Tu cámara local" />
            ) : (
              <span aria-hidden="true"><Camera size={20} /></span>
            )}
            <em>Tú</em>
          </div>
        </div>
      ) : (
        <div className="ctv-voice-stage">
          <div className="ctv-voice-rings" aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="ctv-voice-mark" aria-hidden="true">
            <BrandMark size={54} />
          </div>
          <p className="ctv-voice-caption">Escuchando — sesión simulada</p>
          <div className="ctv-voice-meter" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        </div>
      )}

      <div className="ctv-call-ideas" aria-live="polite">
        <h3>Ideas destacadas</h3>
        {ideas.length ? (
          <ol>
            {ideas.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ol>
        ) : (
          <p>Aparecerán mientras avanza la conversación.</p>
        )}
      </div>

      {cameraError && <p className="ctv-alert" role="status">{cameraError}</p>}

      <div className="ctv-call-controls">
        <button
          type="button"
          className={`ctv-round${muted ? " is-muted" : ""}`}
          aria-pressed={muted}
          aria-label={muted ? "Activar micrófono" : "Silenciar micrófono"}
          onClick={() => setMuted((current) => !current)}
        >
          {muted ? <MicOff size={19} aria-hidden="true" /> : <Mic size={19} aria-hidden="true" />}
        </button>
        {mode === "video" && (
          <>
            <button
              type="button"
              className={`ctv-round${camera ? " is-on" : ""}`}
              aria-pressed={camera}
              aria-label={camera ? "Apagar mi cámara" : "Encender mi cámara local"}
              onClick={() => {
                setCameraError("");
                setCamera((current) => !current);
              }}
            >
              {camera ? <Video size={19} aria-hidden="true" /> : <VideoOff size={19} aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="ctv-round"
              aria-pressed={!videoEnabled}
              aria-label={videoEnabled ? "Ocultar la vista de vídeo" : "Mostrar la vista de vídeo"}
              onClick={() => {
                setVideoEnabled((current) => !current);
                if (videoEnabled) setCamera(false);
              }}
            >
              <CameraOff size={19} aria-hidden="true" />
            </button>
          </>
        )}
        <button type="button" className="ctv-round ctv-round--end" aria-label="Finalizar la conversación" onClick={finish}>
          <PhoneOff size={19} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
