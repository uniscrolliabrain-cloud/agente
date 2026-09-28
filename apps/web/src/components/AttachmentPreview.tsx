import { X } from "lucide-react";

interface Props {
  url: string;
  name: string;
  mimeType?: string;
  onClose: () => void;
}

export default function AttachmentPreview({ url, name, mimeType, onClose }: Props) {
  const isImage = mimeType?.startsWith("image/") ?? /\\.(png|jpe?g|gif|webp|svg)$/i.test(name);
  const isPdf = mimeType === "application/pdf" || /\\.pdf$/i.test(name);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title" title={name}>{name}</div>
            <div className="modal-sub">{mimeType ?? "archivo"}</div>
          </div>
          <div className="control-row" style={{ gap: 6 }}>
            <a className="ctrl-btn" href={url} target="_blank" rel="noreferrer">Abrir en pestana</a>
            <button className="ghost-icon-button" onClick={onClose} aria-label="Cerrar"><X size={17} /></button>
          </div>
        </div>
        <div className="modal-body preview-body">
          {isImage ? (
            <img src={url} alt={name} className="preview-image" />
          ) : isPdf ? (
            <embed src={url} type="application/pdf" className="preview-pdf" />
          ) : (
            <div className="muted" style={{ padding: 20 }}>
              Este tipo de archivo no tiene preview. 
              <a href={url} target="_blank" rel="noreferrer">Abrirlo en una pestana</a>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
