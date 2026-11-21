import { useEffect, useId, useRef, useState } from "react";
import { ArrowUp, Check, LoaderCircle, MessageCircle, Mic, Paperclip, Square, Video, X } from "lucide-react";
import { uploadFile } from "../api/files";
import type { ChatAttachment } from "../types/api";

interface Props {
  seed?: string;
  onSeedConsumed?: () => void;
  onSend: (text: string, attachment?: ChatAttachment) => void;
  onCancel: () => void;
  streaming: boolean;
  sendDisabled?: boolean;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; [key: number]: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

type AttachState =
  | { kind: "uploading"; file: File }
  | { kind: "ready"; file: File; attachment: ChatAttachment }
  | { kind: "error"; file: File; message: string };

export default function ChatInput({ onSend, onCancel, streaming, sendDisabled, seed, onSeedConsumed }: Props) {
  const [value, setValue] = useState("");
  const [dictationError, setDictationError] = useState(false);
  const availabilityId = useId();
  const speechWindow = window as SpeechWindow;
  const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  const [listening, setListening] = useState(false);
  const [attach, setAttach] = useState<AttachState | null>(null);

  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  useEffect(() => () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onend = null;
    recognition.onerror = null;
    recognition.stop();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  useEffect(() => {
    if (seed) {
      setValue(seed);
      onSeedConsumed?.();
    }
  }, [seed, onSeedConsumed]);

  const pickFile = async (file: File) => {
    setAttach({ kind: "uploading", file });
    try {
      const uploaded = await uploadFile(file);
      setAttach({
        kind: "ready",
        file,
        attachment: { id: uploaded.id, name: uploaded.name, size: uploaded.size },
      });
    } catch (err) {
      setAttach({
        kind: "error",
        file,
        message: err instanceof Error ? err.message : "Error al subir",
      });
    }
  };

  const submit = () => {
    if (streaming || sendDisabled) return;
    if (!value.trim() && attach?.kind !== "ready") return;
    const attachment = attach?.kind === "ready" ? attach.attachment : undefined;
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.stop();
    }
    onSend(value.trim(), attachment);
    setValue("");
    setAttach(null);
    if (ref.current) ref.current.style.height = "auto";
  };

  const startVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognition) return;

    setDictationError(false);
    const selectionStart = ref.current?.selectionStart ?? value.length;
    const selectionEnd = ref.current?.selectionEnd ?? selectionStart;
    const prefix = value.slice(0, selectionStart);
    const suffix = value.slice(selectionEnd);
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const words = Array.from(event.results, result => result[0].transcript.trim()).filter(Boolean);
      if (!words.length || recognitionRef.current !== recognition) return;
      const insert = words.join(" ");
      const before = prefix && !/\s$/.test(prefix) ? `${prefix} ` : prefix;
      const after = suffix && !/^\s/.test(suffix) ? ` ${suffix}` : suffix;
      setValue(`${before}${insert}${after}`);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setDictationError(true);
      recognition.onend?.();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognition.onerror();
    }
  };

  const canSend = Boolean(value.trim()) || attach?.kind === "ready";

  return (
    <div className="v2-composer">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          if (recognitionRef.current) {
            recognitionRef.current.onresult = null;
            recognitionRef.current.stop();
          }
          setValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Pregunta lo que quieras o pide que ejecute un SOP..."
        rows={2}
        disabled={streaming}
      />

      {attach && (
        <div className="v2-composer-chip" style={{ marginTop: 8, maxWidth: 260 }}>
          {attach.kind === "uploading" && <LoaderCircle size={13} className="spin" />}
          {attach.kind === "ready" && <Check size={13} />}
          {attach.kind === "error" && <X size={13} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {attach.kind === "error" ? attach.message : attach.file.name}
          </span>
          <button
            type="button"
            onClick={() => setAttach(null)}
            title="Quitar archivo"
            style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--v2-text-3)", display: "grid", placeItems: "center" }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="v2-composer-bottom">
        <div className="v2-composer-tools">
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pickFile(file);
              e.target.value = "";
            }}
          />
          <button
            className="v2-composer-tool"
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={streaming || attach?.kind === "uploading"}
            title="Adjuntar archivo"
          >
            <Paperclip size={16} />
          </button>
          <button
            className="v2-composer-tool"
            type="button"
            disabled
            aria-label="Próximamente: conversación de voz con ElevenLabs"
            aria-describedby={availabilityId}
            title="Próximamente: conversación de voz con ElevenLabs"
          >
            <MessageCircle size={16} aria-hidden="true" />
          </button>
          <button
            className="v2-composer-tool"
            type="button"
            onClick={startVoice}
            disabled={streaming || !SpeechRecognition}
            aria-label={listening ? "Detener dictado" : SpeechRecognition ? "Transcribir voz" : "Dictado no disponible"}
            aria-pressed={listening}
            title={listening ? "Detener dictado" : SpeechRecognition ? "Transcribir voz" : "Dictado no disponible"}
            style={listening ? { background: "var(--v2-purple-soft)", color: "var(--v2-purple)", borderColor: "var(--v2-purple-border)" } : undefined}
          >
            <Mic size={16} />
          </button>
          <button
            className="v2-composer-tool"
            type="button"
            disabled
            aria-label="Próximamente: videollamada con Anam"
            aria-describedby={availabilityId}
            title="Próximamente: videollamada con Anam"
          >
            <Video size={16} aria-hidden="true" />
          </button>
          <button className="v2-composer-chip" type="button">
            SOPs de Mi empresa
          </button>
        </div>
        {streaming ? (
          <button className="v2-send" type="button" onClick={onCancel} aria-label="Detener" title="Detener">
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button className="v2-send" type="button" disabled={!canSend || sendDisabled} onClick={submit} aria-label="Enviar" title="Enviar">
            <ArrowUp size={17} strokeWidth={2.2} />
          </button>
        )}
      </div>
      <p id={availabilityId} className="v2-composer-availability">
        Próximamente: voz bidireccional y vídeo.{!SpeechRecognition && " Dictado no disponible."}
      </p>
      {dictationError && <p className="v2-composer-availability" role="status">No se pudo iniciar el dictado.</p>}
    </div>
  );
}