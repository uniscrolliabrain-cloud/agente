import { useCallback, useEffect, useState } from "react";
import { FileText, RefreshCw, Search, Trash2 } from "lucide-react";
import type { FileEntry } from "../hooks/useWorkspaceData";
import AttachmentPreview from "./AttachmentPreview";
import { formatBytes, relativeTime } from "../lib/format";
import {
  ragDeleteSource,
  ragIngest,
  ragSearch,
  ragStatus,
  type RagHit,
  type RagStatus,
} from "../api/rag";

interface Props {
  files: FileEntry[];
}

export default function DocumentsView({ files }: Props) {
  const [status, setStatus] = useState<RagStatus | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<RagHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [busySource, setBusySource] = useState<string | null>(null);
  const [preview, setPreview] = useState<FileEntry | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setStatus(await ragStatus());
    } catch {
      setStatus({ configured: false, chunks: 0, sources: 0 });
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus, files.length]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      setHits(await ragSearch(q, 8));
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error en la busqueda");
      setHits(null);
    } finally {
      setSearching(false);
    }
  };

  const ingestFile = async (file: FileEntry) => {
    if (!file.url) {
      setSearchError("Este archivo no tiene URL firmada; no se puede reingestar.");
      return;
    }
    setBusySource(file.id);
    setSearchError(null);
    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error(`No se pudo leer el archivo (${res.status})`);
      const text = await res.text();
      if (!text.trim()) throw new Error("El archivo no tiene texto");
      await ragIngest({ sourceId: file.id, sourceName: file.name, text });
      await refreshStatus();
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error al reingestar");
    } finally {
      setBusySource(null);
    }
  };

  const removeSource = async (sourceId: string) => {
    if (!confirm("Borrar esta fuente del indice RAG?")) return;
    setBusySource(sourceId);
    setSearchError(null);
    try {
      await ragDeleteSource(sourceId);
      await refreshStatus();
      setHits(null);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error al borrar");
    } finally {
      setBusySource(null);
    }
  };

  return (
    <main className="view-shell">
      <div className="view-header">
        <h2>Documentos</h2>
        <span className="view-header-meta">
          {files.length} archivos
          {status?.configured ? ` · ${status.chunks} chunks · ${status.sources} fuentes` : " · RAG inactivo"}
        </span>
      </div>

      <div className="rag-search">
        <div className="rag-search-row">
          <Search size={15} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void runSearch(); }}
            placeholder="Buscar en tus documentos (busqueda semantica)"
            disabled={!status?.configured || searching}
          />
          <button
            className="primary-btn"
            onClick={() => void runSearch()}
            disabled={!status?.configured || searching || !query.trim()}
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
          <button
            className="ctrl-btn"
            onClick={() => void refreshStatus()}
            title="Refrescar estado"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        {!status?.configured && (
          <div className="rag-search-hint">
            Falta GEMINI_API_KEY en el servidor para activar la busqueda semantica.
          </div>
        )}
        {searchError && <div className="chat-error">{searchError}</div>}
        {hits && hits.length > 0 && (
          <div className="rag-results">
            {hits.map((hit) => (
              <div key={hit.id} className="rag-result">
                <div className="rag-result-meta">
                  <span className="rag-result-source">{hit.sourceName}</span>
                  <span className="rag-result-score">{(hit.score * 100).toFixed(0)}%</span>
                  <button
                    className="ghost-icon-button"
                    onClick={() => void removeSource(hit.sourceId)}
                    disabled={busySource === hit.sourceId}
                    title="Borrar esta fuente del indice"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="rag-result-text">{hit.text}</div>
              </div>
            ))}
          </div>
        )}
        {hits && hits.length === 0 && (
          <div className="rag-search-hint">Sin resultados.</div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="view-empty">
          <FileText size={22} />
          <p>Aun no has subido documentos.</p>
          <small>Adjunta un PDF o un texto desde el chat para empezar.</small>
        </div>
      ) : (
        <div className="view-docs-grid">
          {files.map((f) => (
            <div key={f.id} className="view-doc-card">
              <div className="view-doc-icon">📄</div>
              <div className="view-doc-body">
                <div
                  className="view-doc-name"
                  title={`${f.name} (doble clic para previsualizar)`}
                  onDoubleClick={() => f.url && setPreview(f)}
                  style={{ cursor: f.url ? "pointer" : "default" }}
                >{f.name}</div>
                <div className="view-doc-meta">
                  {formatBytes(f.size)}{f.size && f.createdAt ? " · " : ""}{relativeTime(f.createdAt)}
                </div>
                {f.source && <div className="view-doc-source" title={f.source}>{f.source}</div>}
                <div className="view-doc-actions">
                  <button
                    className="ctrl-btn"
                    onClick={() => void ingestFile(f)}
                    disabled={busySource === f.id || !status?.configured}
                    title="Volver a ingestar este archivo en el indice"
                  >
                    {busySource === f.id ? "..." : "Reingestar"}
                  </button>
                  <button
                    className="ctrl-btn"
                    onClick={() => void removeSource(f.id)}
                    disabled={busySource === f.id || !status?.configured}
                    title="Borrar este archivo del indice"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {preview && preview.url && (
        <AttachmentPreview
          url={preview.url}
          name={preview.name}
          mimeType={preview.mimeType}
          onClose={() => setPreview(null)}
        />
      )}
    </main>
  );
}
