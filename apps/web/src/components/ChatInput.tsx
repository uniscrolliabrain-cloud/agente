import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, LoaderCircle, Mic, Paperclip, Square, X } from "lucide-react";
import { uploadFile } from "../api/files";
import type { ChatAttachment } from "../types/api";

interface Props {
  onSend: (text: string, attachment?: ChatAttachment) => void;
  onCancel: () => void;
  streaming: boolean;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; [key: number]: { transcript: string } }> }) => void) | null;
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

export default function ChatInput({ onSend, onCancel, streaming }: Props) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [attach, setAttach] = useState<AttachState | null>(null);

  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

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
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      setValue((current) => {
        const base = current.replace(/\s+$/, "");
        return base ? `${base} ${transcript}` : transcript;
      });
    };
    recognition.onend = () => { setListening(false); recognitionRef.current = null; };
    recognition.onerror = () => { setListening(false); recognitionRef.current = null; };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const canSend = Boolean(value.trim()) || attach?.kind === "ready";

  return (
    <div className="composer-area">
      <div className={`composer ${listening ? "listening" : ""}`}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Pregunta lo que quieras..."
          rows={1}
          disabled={streaming}
        />

        {attach && (
          <div className="attachment-chip">
            {attach.kind === "uploading" && <LoaderCircle size={13} className="spin" />}
            {attach.kind === "ready" && <Check size={13} />}
            {attach.kind === "error" && <X size={13} />}
            <span title={attach.kind === "error" ? attach.message : attach.file.name}>
              {attach.file.name}
            </span>
            <button type="button" onClick={() => setAttach(null)} title="Quitar archivo">
              <X size={12} />
            </button>
          </div>
        )}

        <div className="composer-bottom">
          <div className="composer-tools">
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
              className="composer-tool"
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={streaming || attach?.kind === "uploading"}
              title="Adjuntar archivo"
            >
              <Paperclip size={16} />
              <span>Adjuntar</span>
            </button>
            <button
              className={`composer-tool ${listening ? "active" : ""}`}
              type="button"
              onClick={startVoice}
              disabled={streaming}
              title="Transcribir voz"
            >
              <Mic size={16} />
              <span>{listening ? "Escuchando..." : "Voz"}</span>
            </button>
          </div>

          {streaming ? (
            <button className="send-button stop" type="button" onClick={onCancel} title="Detener">
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              className="send-button"
              type="button"
              disabled={!canSend}
              onClick={submit}
              title="Enviar"
            >
              <ArrowUp size={17} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      <div className="composer-hint">
        <span>Enter para enviar</span>
        <span>·</span>
        <span>Shift + Enter para nueva línea</span>
      </div>
    </div>
  );
}
