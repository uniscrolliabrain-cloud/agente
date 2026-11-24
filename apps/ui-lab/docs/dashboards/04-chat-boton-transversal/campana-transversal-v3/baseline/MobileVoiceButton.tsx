import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";

const HOLD_MS = 420;

interface Props {
  disabled: boolean;
  listening: boolean;
  canDictate: boolean;
  onDictate: () => void;
  onNote: (blob: Blob, seconds: number) => void;
}

interface Recording {
  pointer: number;
  timer?: number;
  held: boolean;
  recorder?: MediaRecorder;
  stream?: MediaStream;
  started?: number;
}

export default function MobileVoiceButton({ disabled, listening, canDictate, onDictate, onNote }: Props) {
  const gesture = useRef<Recording | null>(null);
  const suppressClick = useRef(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  function release(send: boolean) {
    const current = gesture.current;
    if (!current) return;
    gesture.current = null;
    window.clearTimeout(current.timer);
    if (current.recorder?.state === "recording") {
      if (!send) current.recorder.onstop = null;
      current.recorder.stop();
    }
    current.stream?.getTracks().forEach((track) => track.stop());
  }

  useEffect(() => () => release(false), []);

  async function record(current: Recording) {
    current.held = true;
    setRecording(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Grabación no disponible");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (gesture.current !== current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      current.stream = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = ({ data }) => { if (data.size) chunks.push(data); };
      recorder.onstop = () => {
        const clip = new Blob(chunks, { type: recorder.mimeType });
        if (clip.size) onNote(clip, Math.max(1, Math.round((performance.now() - (current.started ?? 0)) / 1000)));
      };
      recorder.onerror = () => {
        if (gesture.current !== current) return;
        release(false);
        setRecording(false);
        setError("Se interrumpió la grabación.");
      };
      recorder.start();
      current.recorder = recorder;
      current.started = performance.now();
    } catch {
      if (gesture.current !== current) return;
      release(false);
      setRecording(false);
      setError("No se pudo grabar. Revisa el permiso del micrófono.");
    }
  }

  return (
    <>
      <button
        type="button"
        className={`v2-composer-tool mobile-voice-button${listening || recording ? " active" : ""}`}
        aria-label={listening ? "Detener dictado" : "Dictar texto"}
        aria-describedby="mobile-voice-help"
        aria-pressed={listening || recording}
        disabled={disabled}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          suppressClick.current = false;
          if (listening) return;
          setError("");
          const current: Recording = { pointer: event.pointerId, held: false };
          gesture.current = current;
          event.currentTarget.setPointerCapture(event.pointerId);
          current.timer = window.setTimeout(() => {
            suppressClick.current = true;
            void record(current);
          }, HOLD_MS);
        }}
        onPointerUp={(event) => {
          const current = gesture.current;
          if (current?.pointer !== event.pointerId) return;
          if (current.held && !current.recorder) setError("Mantén pulsado después de dar permiso para grabar.");
          release(true);
          setRecording(false);
        }}
        onLostPointerCapture={() => { release(false); setRecording(false); }}
        onPointerCancel={() => { suppressClick.current = true; release(false); setRecording(false); }}
        onClick={(event) => {
          if (event.detail && suppressClick.current) return;
          setError("");
          if (canDictate) onDictate();
          else setError("El dictado no está disponible en este navegador.");
        }}
      >
        <Mic size={18} aria-hidden="true" />
      </button>
      <span id="mobile-voice-help" className="mobile-chat-sr">Pulsa para dictar. Mantén pulsado para grabar y suelta para añadir la nota de voz al hilo.</span>
      {(recording || listening || error) && (
        <span className="mobile-voice-status" role="status">
          {error || (recording ? "Grabando · suelta para enviar" : "Dictando…")}
        </span>
      )}
    </>
  );
}
