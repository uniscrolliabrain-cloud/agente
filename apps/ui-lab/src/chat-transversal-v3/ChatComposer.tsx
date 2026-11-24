// CHAT_TRANSVERSAL_V3 — compositor multimodal. Conserva el contrato original:
// pulsación breve dicta, pulsación larga graba una nota local, y el «+» abre las
// diez acciones en un diálogo nativo para no salir del orden de capas.
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, LoaderCircle, Mic, Phone, Plus, Square, Video, X } from "lucide-react";
import ChatActions from "./ChatActions";
import type { CallMode } from "./chat-data";

const HOLD_MS = 420;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

type Attachment = { kind: "ready"; name: string; local: boolean } | { kind: "error"; name: string };

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onNote: (blob: Blob, seconds: number) => void;
  onCall: (mode: CallMode) => void;
  streaming: boolean;
}

export default function ChatComposer({ value, onChange, onSend, onStop, onNote, onCall, streaming }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const gesture = useRef<{
    pointer: number;
    timer?: number;
    held: boolean;
    recorder?: MediaRecorder;
    stream?: MediaStream;
    started?: number;
  } | null>(null);
  const suppressClick = useRef(false);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const speechWindow = window as SpeechWindow;
  const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [value]);

  useEffect(
    () => () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.stop();
      }
      const current = gesture.current;
      gesture.current = null;
      window.clearTimeout(current?.timer);
      if (current?.recorder?.state === "recording") {
        current.recorder.onstop = null;
        current.recorder.stop();
      }
      current?.stream?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const stopRecognition = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.stop();
  };

  const submit = () => {
    if (streaming) return;
    const text = value.trim();
    if (!text && !attachment) return;
    stopRecognition();
    onSend(text || `Adjunto local: ${attachment?.name ?? ""}`);
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const startDictation = () => {
    if (listening) {
      stopRecognition();
      return;
    }
    if (!SpeechRecognition) {
      setStatus("El dictado no está disponible en este navegador.");
      return;
    }
    setStatus("");
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const words = Array.from(event.results, (result) => result[0].transcript.trim()).filter(Boolean);
      if (words.length) onChange(words.join(" "));
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
      setStatus("No se pudo iniciar el dictado.");
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognition.onerror?.();
    }
  };

  const releaseNote = (send: boolean) => {
    const current = gesture.current;
    if (!current) return;
    gesture.current = null;
    window.clearTimeout(current.timer);
    if (current.recorder?.state === "recording") {
      if (!send) current.recorder.onstop = null;
      current.recorder.stop();
    }
    current.stream?.getTracks().forEach((track) => track.stop());
    setRecording(false);
  };

  const beginNote = async (current: NonNullable<typeof gesture.current>) => {
    current.held = true;
    setRecording(true);
    setStatus("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("sin soporte");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (gesture.current !== current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      current.stream = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = ({ data }) => {
        if (data.size) chunks.push(data);
      };
      recorder.onstop = () => {
        const clip = new Blob(chunks, { type: recorder.mimeType });
        if (clip.size) onNote(clip, Math.max(1, Math.round((performance.now() - (current.started ?? 0)) / 1000)));
      };
      recorder.onerror = () => {
        releaseNote(false);
        setStatus("Se interrumpió la grabación.");
      };
      recorder.start();
      current.recorder = recorder;
      current.started = performance.now();
    } catch {
      releaseNote(false);
      setStatus("No se pudo grabar. Revisa el permiso del micrófono.");
    }
  };

  const canSend = Boolean(value.trim()) || Boolean(attachment);

  return (
    <div className="ctv-composer-shell">
      <div className="ctv-composer">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            stopRecognition();
            onChange(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Pregunta, pide o dicta lo que necesitas…"
          rows={1}
          disabled={streaming}
          aria-label="Mensaje para LAIA"
        />

        {attachment && (
          <div className={`ctv-attachment${attachment.kind === "error" ? " is-error" : ""}`}>
            {attachment.kind === "error" ? <X size={13} aria-hidden="true" /> : <Check size={13} aria-hidden="true" />}
            <span>
              {attachment.name}
              {attachment.kind === "ready" && attachment.local ? " · local, no se sube" : ""}
            </span>
            <button type="button" aria-label="Quitar adjunto" onClick={() => setAttachment(null)}>
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="ctv-composer-tools">
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setAttachment({ kind: "ready", name: file.name, local: true });
              event.target.value = "";
            }}
          />
          <button
            ref={plusRef}
            type="button"
            className="ctv-tool"
            aria-label="Abrir acciones"
            aria-haspopup="dialog"
            aria-expanded={actionsOpen}
            disabled={streaming}
            onClick={() => {
              stopRecognition();
              setActionsOpen(true);
            }}
          >
            <Plus size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={`ctv-tool${listening || recording ? " is-active" : ""}`}
            aria-label={listening ? "Detener dictado" : "Dictar texto"}
            aria-describedby="ctv-voice-help"
            aria-pressed={listening || recording}
            disabled={streaming}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0 || listening) return;
              suppressClick.current = false;
              const current: NonNullable<typeof gesture.current> = { pointer: event.pointerId, held: false };
              gesture.current = current;
              setStatus("");
              event.currentTarget.setPointerCapture(event.pointerId);
              current.timer = window.setTimeout(() => {
                suppressClick.current = true;
                void beginNote(current);
              }, HOLD_MS);
            }}
            onPointerUp={(event) => {
              if (gesture.current?.pointer !== event.pointerId) return;
              releaseNote(true);
            }}
            onLostPointerCapture={() => releaseNote(false)}
            onPointerCancel={() => {
              suppressClick.current = true;
              releaseNote(false);
            }}
            onClick={(event) => {
              if (event.detail && suppressClick.current) return;
              startDictation();
            }}
          >
            <Mic size={18} aria-hidden="true" />
          </button>

          <button type="button" className="ctv-tool" aria-label="Conversación por voz" disabled={streaming} onClick={() => onCall("voice")}>
            <Phone size={17} aria-hidden="true" />
          </button>
          <button type="button" className="ctv-tool" aria-label="Videollamada con LAIA" disabled={streaming} onClick={() => onCall("video")}>
            <Video size={18} aria-hidden="true" />
          </button>

          <span className="ctv-composer-spacer" aria-hidden="true" />

          {streaming ? (
            <button type="button" className="ctv-send is-stop" onClick={onStop} aria-label="Detener la respuesta">
              <Square size={13} fill="currentColor" aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="ctv-send" disabled={!canSend} onClick={submit} aria-label="Enviar el mensaje">
              <ArrowUp size={17} strokeWidth={2.2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <p id="ctv-voice-help" className="ctv-hint">
        Pulsa para dictar · mantén pulsado para grabar una nota · datos de demostración
      </p>
      <span className="ctv-sr" role="status">
        {recording ? "Grabando una nota de voz" : listening ? "Dictando" : status}
      </span>
      {status && !recording && !listening && <p className="ctv-alert" role="status">{status}</p>}
      {recording && <p className="ctv-recording" role="status"><LoaderCircle size={13} className="ctv-spin" aria-hidden="true" /> Grabando · suelta para añadir</p>}

      {actionsOpen && (
        <ChatActions
          onClose={() => {
            setActionsOpen(false);
            requestAnimationFrame(() => plusRef.current?.focus({ preventScroll: true }));
          }}
          onPick={(accept, capture) => {
            const input = fileRef.current;
            if (!input) return;
            input.accept = accept;
            if (capture) input.setAttribute("capture", capture);
            else input.removeAttribute("capture");
            input.click();
          }}
          onDraft={(text) => {
            onChange(value.trim() ? `${value.trim()}\n${text}` : text);
            requestAnimationFrame(() => textareaRef.current?.focus());
          }}
        />
      )}
    </div>
  );
}
