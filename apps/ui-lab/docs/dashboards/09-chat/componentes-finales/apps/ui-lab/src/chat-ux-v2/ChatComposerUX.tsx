// CHAT_UX_V2_COMPOSER - copia adaptada de apps/web/src/components/ChatInput.tsx
// (main d7260009). Conserva props, atajos, dictado, adjunto, chip SOP y envio.
// Unicas diferencias: la subida se inyecta (fixture sin red) y Enter respeta la
// composicion IME. Documentado en matriz-paridad.md.

import { ArrowUp, Check, LoaderCircle, Mic, Paperclip, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatAttachment } from "../../../web/src/types/api";

interface Props {
  seed?: string;
  onSeedConsumed?: () => void;
  onSend: (text: string, attachment?: ChatAttachment) => void;
  onCancel: () => void;
  streaming: boolean;
  upload: (file: File) => Promise<ChatAttachment>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((event: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; [key: number]: { transcript: string } }>;
      }) => void)
    | null;
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

export default function ChatComposerUX({ onSend, onCancel, streaming, seed, onSeedConsumed, upload }: Props) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [attach, setAttach] = useState<AttachState | null>(null);

  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceBaseRef = useRef<string>("");

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
      const attachment = await upload(file);
      setAttach({ kind: "ready", file, attachment });
    } catch (err) {
      setAttach({ kind: "error", file, message: err instanceof Error ? err.message : "Error al subir" });
    }
  };

  const submit = () => {
    if (streaming) return;
    if (!value.trim() && attach?.kind !== "ready") return;
    const attachment = attach?.kind === "ready" ? attach.attachment : undefined;
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
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final) {
        const base = voiceBaseRef.current.replace(/\s+$/, "");
        voiceBaseRef.current = base ? `${base} ${final.trim()}` : final.trim();
      }
      const base = voiceBaseRef.current;
      const tail = interim.trim();
      setValue(base ? (tail ? `${base} ${tail}` : base) : tail);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    voiceBaseRef.current = value;
    setListening(true);
    recognition.start();
  };

  const canSend = Boolean(value.trim()) || attach?.kind === "ready";

  return (
    <div className="v2-composer cux-composer" data-listening={listening ? "true" : undefined}>
      <textarea
        ref={ref}
        value={value}
        aria-label="Escribe tu mensaje"
        onChange={(e) => setValue(e.target.value)}
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
        <div className="v2-composer-chip cux-attach" data-kind={attach.kind}>
          {attach.kind === "uploading" && <LoaderCircle size={13} className="spin" aria-hidden="true" />}
          {attach.kind === "ready" && <Check size={13} aria-hidden="true" />}
          {attach.kind === "error" && <X size={13} aria-hidden="true" />}
          <span className="cux-attach-name">{attach.kind === "error" ? attach.message : attach.file.name}</span>
          <button
            type="button"
            className="cux-attach-remove"
            onClick={() => setAttach(null)}
            title="Quitar archivo"
            aria-label="Quitar archivo"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="v2-composer-bottom cux-composer-bottom">
        <div className="v2-composer-tools cux-composer-tools">
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
            className="v2-composer-tool cux-tool"
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={streaming || attach?.kind === "uploading"}
            title="Adjuntar archivo"
            aria-label="Adjuntar archivo"
          >
            <Paperclip size={16} aria-hidden="true" />
          </button>
          <button
            className="v2-composer-tool cux-tool"
            type="button"
            onClick={startVoice}
            disabled={streaming}
            title="Transcribir voz"
            aria-label="Transcribir voz"
            aria-pressed={listening}
          >
            <Mic size={16} aria-hidden="true" />
          </button>
          <button className="v2-composer-chip cux-sop" type="button">
            SOPs de Mi empresa
          </button>
        </div>
        {streaming ? (
          <button
            className="v2-send cux-send"
            type="button"
            onClick={onCancel}
            title="Detener"
            aria-label="Detener respuesta"
          >
            <Square size={14} fill="currentColor" aria-hidden="true" />
          </button>
        ) : (
          <button
            className="v2-send cux-send"
            type="button"
            disabled={!canSend}
            onClick={submit}
            title="Enviar"
            aria-label="Enviar mensaje"
          >
            <ArrowUp size={17} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
