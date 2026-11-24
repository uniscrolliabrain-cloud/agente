import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Copy,
  FileText,
  Info,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { BrandLockup } from "../BrandMark";
import CookieBanner from "../CookieBanner";
import { openCookiePreferences } from "../../lib/consent";
import { LEGAL_DOCS } from "./legal-content";
import "../login-v3/agntia-tokens.css";
import "./legal-v1.css";

// LEGAL_V1_PROD_V1 - misma pieza aprobada en UI Lab, alimentada con los seis
// textos publicados en agntiapro.com (versión 2026-11-21). Una sola lectura con
// índice, búsqueda y deep links: /legal#privacidad selecciona el documento.
// No se inventa contenido: si un documento no estuviera publicado, se diría.

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function docFromHash(hash: string) {
  const value = decodeURIComponent(hash.replace(/^#/, ""));
  if (!value) return { docId: LEGAL_DOCS[0].id, sectionId: "" };
  const doc = [...LEGAL_DOCS]
    .sort((a, b) => b.id.length - a.id.length)
    .find((item) => value === item.id || value.startsWith(`${item.id}-`));
  if (!doc) return { docId: LEGAL_DOCS[0].id, sectionId: "" };
  return { docId: doc.id, sectionId: value === doc.id ? "" : value };
}

export default function LegalV1() {
  const initial = docFromHash(typeof window === "undefined" ? "" : window.location.hash);
  const [docId, setDocId] = useState<string>(initial.docId);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("");
  const [copyState, setCopyState] = useState<{ hash: string; ok: boolean } | null>(null);

  const readerRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  const doc = LEGAL_DOCS.find((item) => item.id === docId) ?? LEGAL_DOCS[0];

  const sections = doc.sections.filter((section) => {
    if (!query.trim()) return true;
    const haystack = normalize(
      `${section.title} ${section.paragraphs.join(" ")} ${(section.items ?? []).join(" ")}`,
    );
    return haystack.includes(normalize(query));
  });

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const nodes = articleRef.current?.querySelectorAll<HTMLElement>("[data-section]");
    if (!nodes || nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-12% 0px -62% 0px", threshold: [0, 0.35, 1] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [doc.id, query]);

  // Atrás/adelante y enlaces compartidos: el hash manda sobre el documento.
  useEffect(() => {
    const onHashChange = () => {
      const next = docFromHash(window.location.hash);
      setDocId(next.docId);
      setQuery("");
      window.requestAnimationFrame(() => {
        if (next.sectionId) {
          document.getElementById(next.sectionId)?.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        } else if (window.location.hash) {
          readerRef.current?.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }
      });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Entrada directa: un documento concreto lleva a su lector; una sección
  // concreta lleva a esa sección. Sin hash, la página se queda en la portada.
  useEffect(() => {
    if (!window.location.hash) return;
    const timer = window.setTimeout(() => {
      const target = initial.sectionId ? document.getElementById(initial.sectionId) : readerRef.current;
      target?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }, 60);
    return () => window.clearTimeout(timer);
    // Solo en el montaje: los cambios posteriores llegan por hashchange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = `${doc.label} · Legal · AgntiaPro`;
  }, [doc.label]);

  const scrollToReader = useCallback(() => {
    readerRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const selectDoc = (id: string, options?: { scroll?: boolean }) => {
    setDocId(id);
    setQuery("");
    setCopyState(null);
    if (window.location.hash !== `#${id}`) {
      window.history.replaceState(null, "", `#${id}`);
    }
    if (options?.scroll) scrollToReader();
    window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  const copySectionLink = async (hash: string) => {
    const url = `${location.origin}${location.pathname}${location.search}#${hash}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      ok = false;
    }
    setCopyState({ hash, ok });
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyState(null), 3200);
  };

  return (
    <div className="agntia-workspace legal-v1">
      <a className="lg-skip" href="#documento">
        Ir al documento
      </a>

      <header className="lg-header">
        <div className="lg-wrap lg-header-inner">
          <a className="lg-brand" href="/" aria-label="AgntiaPro, volver al acceso">
            <BrandLockup markSize={32} />
          </a>
          <nav className="lg-header-nav" aria-label="Acciones de la página">
            <button type="button" className="lg-ghost" onClick={openCookiePreferences}>
              Gestionar cookies
            </button>
            <a className="lg-pill" href="/">
              Volver a AgntiaPro
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="lg-wrap lg-cover" aria-labelledby="lg-cover-title">
          <p className="lg-kicker">Legal · transparencia · confianza</p>
          <h1 id="lg-cover-title" className="lg-cover-title">
            Lo legal, en claro.
            <span>Sin letra pequeña.</span>
          </h1>
          <p className="lg-lead">
            Qué hace AgntiaPro con tus datos, qué papel tiene LAIA y dónde decides tú. Sin jerga y sin
            promesas que no podamos sostener.
          </p>
          <div className="lg-cover-meta">
            <span className="lg-chip">
              <ShieldCheck size={14} aria-hidden="true" />
              Documentos publicados
            </span>
            <span className="lg-meta-text">
              Versión del {doc.version}. Seis documentos, una sola lectura.
            </span>
          </div>
          <div className="lg-cover-actions">
            <button
              type="button"
              className="lg-cta"
              onClick={() => selectDoc("transparencia-ia", { scroll: true })}
            >
              Cómo decide LAIA
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <a className="lg-cta-ghost" href="#documentos">
              Ver los seis documentos
            </a>
          </div>
        </section>

        <section className="lg-wrap lg-index" id="documentos" aria-labelledby="lg-index-title">
          <h2 id="lg-index-title" className="lg-section-title">
            Seis documentos, una lectura
          </h2>
          <div className="lg-index-grid">
            <article className="lg-feature">
              <p className="lg-kicker lg-kicker-violet">
                <Sparkles size={14} aria-hidden="true" />
                Transparencia IA
              </p>
              <h3 className="lg-feature-title">LAIA prepara, propone y espera tu aprobación.</h3>
              <p className="lg-feature-text">
                La IA no firma, no envía y no decide por ti. Lo que prepara se queda a la espera hasta que
                alguien de tu equipo lo aprueba.
              </p>
              <div className="lg-feature-foot">
                <button
                  type="button"
                  className="lg-cta lg-cta-sm"
                  onClick={() => selectDoc("transparencia-ia", { scroll: true })}
                >
                  Leer documento
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <span className="lg-status">Publicado</span>
              </div>
            </article>

            <ul className="lg-doclist">
              {LEGAL_DOCS.map((item, position) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="lg-docrow"
                    aria-current={item.id === doc.id ? "true" : undefined}
                    onClick={() => selectDoc(item.id, { scroll: true })}
                  >
                    <span className="lg-docrow-num">{String(position + 1).padStart(2, "0")}</span>
                    <span className="lg-docrow-copy">
                      <span className="lg-docrow-label">
                        {item.label}
                        <span className="lg-docrow-kind">{item.kind}</span>
                      </span>
                      <span className="lg-docrow-summary">{item.summary}</span>
                    </span>
                    <span className="lg-docrow-state">Publicado</span>
                    <ChevronDown size={16} className="lg-docrow-arrow" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lg-wrap lg-reader" id="documento" aria-labelledby="lg-doc-title" ref={readerRef}>
          <div className="lg-reader-head">
            <p className="lg-kicker">{doc.kind}</p>
            <h2 id="lg-doc-title" className="lg-doc-title" tabIndex={-1} ref={headingRef}>
              {doc.label}
            </h2>
            <p className="lg-doc-summary">{doc.summary}</p>
            <dl className="lg-doc-facts">
              <div>
                <dt>Estado</dt>
                <dd>Publicado</dd>
              </div>
              <div>
                <dt>Ruta pública</dt>
                <dd>/legal#{doc.id}</dd>
              </div>
              <div>
                <dt>Vigencia</dt>
                <dd>{doc.version}</dd>
              </div>
            </dl>
          </div>

          <div className="lg-toolbar">
            <label className="lg-search">
              <Search size={16} aria-hidden="true" />
              <span className="lg-sr">Buscar en este documento</span>
              <input
                type="search"
                value={query}
                placeholder="Buscar en el documento"
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="lg-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </label>
            <p className="lg-toolbar-note" aria-live="polite">
              {query
                ? `${sections.length} de ${doc.sections.length} secciones coinciden`
                : `${doc.sections.length} secciones · versión ${doc.version}`}
            </p>
          </div>

          <div className="lg-reader-grid">
            <aside className="lg-aside" aria-label="Secciones del documento">
              <p className="lg-aside-title">En este documento</p>
              <ol className="lg-aside-list">
                {doc.sections.map((section, position) => (
                  <li key={section.id}>
                    <a
                      href={`#${doc.id}-${section.id}`}
                      aria-current={activeSection === `${doc.id}-${section.id}` ? "true" : undefined}
                      className={
                        query && !sections.some((item) => item.id === section.id) ? "is-dimmed" : undefined
                      }
                    >
                      <span>{String(position + 1).padStart(2, "0")}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="lg-aside-foot">
                <Info size={13} aria-hidden="true" />
                Se resalta la sección que estás leyendo.
              </p>
            </aside>

            <div className="lg-article" ref={articleRef}>
              {sections.length === 0 ? (
                <div className="lg-empty lg-empty-sm">
                  <Search size={20} aria-hidden="true" />
                  <h3>Ninguna sección coincide con «{query.trim()}»</h3>
                  <p>La búsqueda recorre el texto de este documento.</p>
                  <button type="button" className="lg-cta-ghost" onClick={() => setQuery("")}>
                    Limpiar búsqueda
                  </button>
                </div>
              ) : (
                <ol className="lg-sections">
                  {sections.map((section) => {
                    const hash = `${doc.id}-${section.id}`;
                    const position = doc.sections.findIndex((item) => item.id === section.id);
                    return (
                      <li key={section.id}>
                        <section
                          id={hash}
                          data-section
                          className="lg-section"
                          aria-labelledby={`${hash}-title`}
                        >
                          <div className="lg-section-head">
                            <span className="lg-section-num">{String(position + 1).padStart(2, "0")}</span>
                            <h3 id={`${hash}-title`}>{section.title}</h3>
                            <button
                              type="button"
                              className="lg-copy"
                              onClick={() => copySectionLink(hash)}
                              aria-label={`Copiar enlace a la sección ${section.title}`}
                            >
                              <Copy size={14} aria-hidden="true" />
                              Enlace
                            </button>
                          </div>
                          {section.paragraphs.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="lg-section-text"
                              dangerouslySetInnerHTML={{ __html: paragraph }}
                            />
                          ))}
                          {section.items && section.items.length > 0 && (
                            <ul className="lg-section-list">
                              {section.items.map((item) => (
                                <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
                              ))}
                            </ul>
                          )}
                          {copyState?.hash === hash && (
                            <p className="lg-copy-status" role="status">
                              {copyState.ok
                                ? `Enlace copiado: #${hash}`
                                : `No se pudo usar el portapapeles. Enlace: #${hash}`}
                            </p>
                          )}
                        </section>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </section>

        <section className="lg-wrap lg-reader-meta" aria-label="Ayuda sobre estos documentos">
          <div className="lg-empty lg-empty-sm">
            <FileText size={20} aria-hidden="true" />
            <h3>¿Necesitas una aclaración?</h3>
            <p>
              Escríbenos a <a href="mailto:laia@agntiapro.com">laia@agntiapro.com</a>. También puedes
              revisar cómo tratamos tus datos o cambiar tus preferencias de cookies.
            </p>
            <button type="button" className="lg-cta-ghost" onClick={openCookiePreferences}>
              Preferencias de cookies
            </button>
          </div>
        </section>
      </main>

      <footer className="lg-footer">
        <div className="lg-wrap lg-footer-inner">
          <p>© 2026 AgntiaPro</p>
          <ul className="lg-footer-links">
            {LEGAL_DOCS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} onClick={() => selectDoc(item.id, { scroll: true })}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
