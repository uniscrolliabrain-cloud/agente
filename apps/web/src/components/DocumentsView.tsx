import { FileText } from "lucide-react";
import type { FileEntry } from "../hooks/useWorkspaceData";

interface Props {
  files: FileEntry[];
}

function formatBytes(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export default function DocumentsView({ files }: Props) {
  return (
    <main className="view-shell">
      <div className="view-header">
        <h2>Documentos</h2>
        <span className="view-header-meta">{files.length} archivos</span>
      </div>

      {files.length === 0 ? (
        <div className="view-empty">
          <FileText size={22} />
          <p>Aún no has subido documentos.</p>
          <small>Adjunta un PDF desde el chat para empezar.</small>
        </div>
      ) : (
        <div className="view-docs-grid">
          {files.map((f) => (
            <div key={f.id} className="view-doc-card">
              <div className="view-doc-icon">📄</div>
              <div className="view-doc-body">
                <div className="view-doc-name" title={f.name}>{f.name}</div>
                <div className="view-doc-meta">
                  {formatBytes(f.size)}{f.size && f.createdAt ? " · " : ""}{relativeTime(f.createdAt)}
                </div>
                {f.source && <div className="view-doc-source" title={f.source}>{f.source}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
