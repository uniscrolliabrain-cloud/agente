// USE_AVATAR_CALL_V1 - cliente de la llamada con cara y voz.
//
// Lo que hace que esto pueda ser una videoconferencia y no un chat con audio:
//   - abre la sesion antes de que el usuario termine de decidirse,
//   - consume el LLM por SSE y corta con AbortController (barge-in),
//   - manda el texto por frases al TTS para que empiece a hablar antes,
//   - no guarda estado global: cada llamada es su propio hook.

import { useCallback, useEffect, useRef, useState } from "react";

export type AvatarCallState = "idle" | "requesting" | "connecting" | "live" | "closed" | "error";

export interface AvatarAgent {
  agentId: string;
  displayName: string;
  role: string;
  language: string;
  voice: { configured: boolean; voiceId: string; model: string };
  avatar: { configured: boolean; seed: string; style: string };
}

export interface AvatarSessionInfo {
  id: string;
  agentId: string;
  state: string;
  turns: number;
}

interface UseAvatarCallOptions {
  agentId: string;
  onSentence?: (sentence: string, index: number) => void;
}

const SENTENCE_END = /([.!?…]+)(\s|$)/;

/**
 * Trocea el stream en frases. El TTS no debe esperar al parrafo entero: con la
 * primera frase ya hay audio.
 */
export function sentenceSplitter(onSentence: (sentence: string, index: number) => void) {
  let buffer = "";
  let index = 0;
  return {
    push(delta: string) {
      buffer += delta;
      for (;;) {
        const match = SENTENCE_END.exec(buffer);
        if (!match) return;
        const end = match.index + match[1].length;
        const sentence = buffer.slice(0, end).trim();
        buffer = buffer.slice(end).trimStart();
        if (sentence) onSentence(sentence, index++);
      }
    },
    flush() {
      const rest = buffer.trim();
      buffer = "";
      if (rest) onSentence(rest, index++);
    },
  };
}

export function useAvatarCall({ agentId, onSentence }: UseAvatarCallOptions) {
  const [state, setState] = useState<AvatarCallState>("idle");
  const [session, setSession] = useState<AvatarSessionInfo | null>(null);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<AvatarSessionInfo | null>(null);

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    const current = sessionRef.current;
    sessionRef.current = null;
    setSession(null);
    setState("closed");
    if (current) {
      await fetch(`/api/avatar/sessions/${current.id}`, { method: "DELETE" }).catch(() => undefined);
    }
  }, []);

  useEffect(() => () => void stop(), [stop]);

  const start = useCallback(async () => {
    setError(null);
    setState("requesting");
    try {
      const response = await fetch("/api/avatar/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      if (!response.ok) throw new Error(`No se pudo abrir la llamada (${response.status})`);
      const payload = (await response.json()) as { session: AvatarSessionInfo };
      sessionRef.current = payload.session;
      setSession(payload.session);
      setState("connecting");
      // El SDK de Anam se monta en el componente: aqui solo se marca listo.
      setState("live");
    } catch (cause) {
      setState("error");
      setError(cause instanceof Error ? cause.message : "Error al abrir la llamada");
    }
  }, [agentId]);

  const speak = useCallback(
    async (text: string) => {
      const current = sessionRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      const splitter = sentenceSplitter((sentence, index) => onSentence?.(sentence, index));
      let collected = "";
      try {
        const response = await fetch("/api/avatar/llm", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(current ? { "x-avatar-session": current.id } : {}),
            "x-avatar-agent": agentId,
          },
          body: JSON.stringify({
            model: agentId,
            stream: true,
            messages: [{ role: "user", content: text }],
          }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error(`LLM ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const event of events) {
            const line = event.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const chunk = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
                error?: { message?: string };
              };
              if (chunk.error?.message) throw new Error(chunk.error.message);
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                collected += delta;
                setTranscript(collected);
                splitter.push(delta);
              }
            } catch {
              // Un chunk raro no corta la llamada.
            }
          }
        }
        splitter.flush();
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Error del modelo");
      }
    },
    [agentId, onSentence],
  );

  /** Barge-in: el usuario habla, se corta el turno y se avisa al backend. */
  const interrupt = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = null;
    const current = sessionRef.current;
    if (!current) return;
    await fetch(`/api/avatar/sessions/${current.id}/interrupt`, { method: "POST" }).catch(
      () => undefined,
    );
  }, []);

  return { state, session, transcript, error, start, stop, speak, interrupt };
}
