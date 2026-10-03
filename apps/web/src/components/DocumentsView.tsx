// FIX_02_DOCSVIEW_CLEAN_V1 - imports DocumentTree/MultiUpload pendientes de wire.
// BUG05_DOCUMENTS_VIEW_V2 - usa DocumentTree + MultiUpload.
// E2_DOCUMENTS_VIEW_V2 - usar DocumentTree + MultiUpload + search RAG.
// UI_PANEL_SLIDE_V1_USE
// DOCUMENTS_REINGEST_SERVER_V1 - reingesta via endpoint server-side.
import { useCallback, useEffect, useState } from "react";
import { FileText, RefreshCw, Search, Trash2 } from "lucide-react";
import type { FileEntry } from "../hooks/useWorkspaceData";
import AttachmentPreview from "./AttachmentPreview";
// WIRE_DOCS_TREE_UPLOAD_V1
import { formatBytes, relativeTime } from "../lib/format";
import {
  ragDeleteSource,
  ragReingest,
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
      await ragReingest(file.id);
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
    <div className="v2-tasks-view" style={{ maxWidth: 900 }}>
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Documentos</h1>
        <div className="v2-tasks-meta">
          {files.length} archivos
          {status?.configured
            ? ` · ${status.chunks} chunks · ${status.sources} fuentes`
            : " · RAG inactivo"}
        </div>
      </div>

      <div className="v2-composer" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} style={{ color: "var(--v2-text-3)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void runSearch(); }}
            placeholder="Buscar en tus documentos (busqueda semantica)"
            disabled={!status?.configured || searching}
            style={{
              flex: 1,
              border: 0,
              outline: 0,
              background: "transparent",
              fontSize: 14,
              color: "var(--v2-text)",
              fontFamily: "inherit",
            }}
          />
          <button
            className="v2-need-action-btn"
            onClick={() => void runSearch()}
            disabled={!status?.configured || searching || !query.trim()}
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
          <button className="v2-pill" onClick={() => void refreshStatus()} title="Refrescar estado">
            <RefreshCw size={14} />
          </button>
        </div>
        {!status?.configured && (
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--v2-text-3)" }}>
            Falta GEMINI_API_KEY en el servidor para activar la busqueda semantica.
          </div>
        )}
        {searchError && (
          <div className="chat-error" style={{ marginTop: 12 }}>{searchError}</div>
        )}
        {hits && hits.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {hits.map((hit) => (
              <div
                key={hit.id}
                style={{
                  padding: 12,
                  background: "var(--v2-bg-soft)",
                  border: "1px solid var(--v2-border)",
                  borderRadius: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: "var(--v2-text-2)" }}>{hit.sourceName}</span>
                  <span style={{ color: "var(--v2-purple)", fontWeight: 600 }}>{Math.min(100, Math.round(hit.score * 100))}%</span>
                  <button
                    className="v2-pill"
                    onClick={() => void removeSource(hit.sourceId)}
                    disabled={busySource === hit.sourceId}
                    title="Borrar esta fuente del indice"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--v2-text)" }}>{hit.text}</div>
              </div>
            ))}
          </div>
        )}
        {hits && hits.length === 0 && (
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--v2-text-3)" }}>Sin resultados.</div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="v2-tasks-empty">
          <FileText size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>Aun no has subido documentos.</p>
          <small style={{ color: "var(--v2-text-3)" }}>Adjunta un PDF o un texto desde el chat para empezar.</small>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {files.map((f) => (
            <div key={f.id} className="v2-suggestion-card" style={{ cursor: "default" }}>
              <div className="v2-suggestion-icon">📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={f.name}
                >{f.name}</div>
                <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 4 }}>
                  {formatBytes(f.size)}{f.size && f.createdAt ? " · " : ""}{relativeTime(f.createdAt)}
                </div>
                {f.source && (
                  <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.source}>
                    {f.source}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    className="v2-pill"
                    onClick={() => void ingestFile(f)}
                    disabled={busySource === f.id || !status?.configured}
                  >
                    {busySource === f.id ? "..." : "Reingestar"}
                  </button>
                  <button
                    className="v2-pill"
                    onClick={() => void removeSource(f.id)}
                    disabled={busySource === f.id || !status?.configured}
                  >
                    <Trash2 size={12} />
                  </button>
                  {f.url && (
                    <button className="v2-pill" onClick={() => setPreview(f)}>Ver</button>
                  )}
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
    </div>
  );
}