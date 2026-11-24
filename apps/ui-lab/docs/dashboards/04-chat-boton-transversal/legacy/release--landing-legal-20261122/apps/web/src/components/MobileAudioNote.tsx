import { useState } from "react";
import { Copy, Download, Mic } from "lucide-react";

export interface AudioNote {
  id: string;
  blob: Blob;
  url: string;
  seconds: number;
  name: string;
}

export default function MobileAudioNote({ note }: { note: AudioNote }) {
  const [feedback, setFeedback] = useState("");

  async function copy() {
    try {
      if (!navigator.clipboard.write || typeof ClipboardItem === "undefined") throw new Error();
      await navigator.clipboard.write([new ClipboardItem({ [note.blob.type]: note.blob })]);
      setFeedback("Audio copiado");
    } catch {
      try {
        await navigator.clipboard.writeText(note.url);
        setFeedback("Enlace local copiado. Funciona mientras este chat siga abierto.");
      } catch {
        setFeedback("El navegador no permite copiar el audio. Puedes descargarlo.");
      }
    }
  }

  return (
    <article className="mobile-audio-note" aria-label="Nota de voz local">
      <div><Mic size={16} aria-hidden="true" /> <strong>Nota de voz</strong> <span>{note.seconds} s · local</span></div>
      <audio src={note.url} controls preload="metadata" aria-label="Escuchar nota de voz" />
      <div>
        <button type="button" onClick={() => void copy()}><Copy size={15} aria-hidden="true" /> Copiar</button>
        <a href={note.url} download={note.name}><Download size={15} aria-hidden="true" /> Descargar</a>
      </div>
      {feedback && <p role="status">{feedback}</p>}
    </article>
  );
}
