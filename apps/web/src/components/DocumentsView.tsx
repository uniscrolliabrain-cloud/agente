import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import type { FileEntry } from "../hooks/useWorkspaceData";
import { formatBytes, relativeTime } from "../lib/format";
import { ragSearch, ragStatus, type RagHit, type RagStatus } from "../api/rag";

interface Props {
  files: FileEntry[];
}

export default function DocumentsView({ files }: Props) {
  const [status, setStatus] = useState<RagStatus | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<RagHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const s = await ragStatus();
        if (!cancelled) setStatus(s);
      } catch {
        if (!cancelled) setStatus({ configured: false, chunks: 0, sources: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [files.length]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      const result = await ragSearch(q, 8);
      setHits(result);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error en la búsqueda");
      setHits(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <main className="view-shell">
      <div className="view-header">
        <h2>Documentos</h2>
        <span className="view-header-meta">
          {files.length} archivos
          {status?.configured ? ` · ${status.chunks} chunks indexados` : " · RAG inactivo"}
        </span>
      </div>

      <div className="rag-search">
        <div className="rag-search-row">
          <Search size={15} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch();
            }}
            placeholder="Buscar en tus documentos (búsqueda semántica)"
            disabled={!status?.configured || searching}
          />
          <button
            className="primary-btn"
            onClick={() => void runSearch()}
            disabled={!status?.configured || searching || !query.trim()}
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {!status?.configured && (
          <div className="rag-search-hint">
            Falta GEMINI_API_KEY en el servidor para activar la búsqueda semántica.
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