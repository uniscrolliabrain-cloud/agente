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
import { BrandLockup } from "../../../web/src/components/BrandMark";
import { legalUrl } from "../vendor/config/publicSite";
import "../design-system/agntia-tokens.css";
import "./legal-v1.css";

// LEGAL_V1_LAB_V1 - superficie legal editoral aislada en UI Lab.
// No hay textos jurídicos aprobados ni páginas publicadas: cada documento se
// muestra como esquema de secciones con su estado real. No se inventan
// vigencias, sellos, certificaciones ni acciones que no existan.

type Section = { id: string; title: string; note: string };
type LegalDoc = {
  id: string;
  label: string;
  kind: string;
  summary: string;
  route: keyof ReturnType<typeof routeTable>;
  status: "outline" | "missing";
  sections: Section[];
};

// Rutas declaradas en publicSite.ts (legalPages); ninguna tiene página publicada
// todavía en apps/site. La UI lo dice en lugar de simular un documento.
function routeTable() {
  return {
    notice: legalUrl("notice"),
    privacy: legalUrl("privacy"),
    terms: legalUrl("terms"),
    cookies: legalUrl("cookies"),
    ai: legalUrl("ai"),
    trust: legalUrl("trust"),
  };
}

const documents: LegalDoc[] = [
  {
    id: "aviso-legal",
    label: "Aviso legal",
    kind: "Quién está detrás",
    summary: "Titular, contacto y reglas de uso de este sitio.",
    route: "notice",
    status: "outline",
    sections: [
      { id: "titular", title: "Titular y contacto", note: "Quién presta el servicio y por dónde se le escribe." },
      { id: "sitio", title: "Qué se puede hacer en este sitio", note: "Uso previsto de las páginas públicas y límites." },
      { id: "responsabilidad", title: "Responsabilidad", note: "Qué cubre AgntiaPro y qué depende de ti." },
    ],
  },
  {
    id: "privacidad",
    label: "Privacidad",
    kind: "Tus datos",
    summary: "Qué se recoge, para qué y cuánto tiempo se guarda.",
    route: "privacy",
    status: "outline",
    sections: [
      { id: "datos", title: "Qué datos tratamos", note: "Los que pides tú, los que llegan de tu equipo y los opcionales." },
      { id: "finalidad", title: "Para qué los usamos", note: "Prestar el servicio, avisarte y nada más." },
      { id: "conservacion", title: "Cuánto tiempo", note: "Plazos de conservación y qué pasa al cerrar la cuenta." },
      { id: "derechos", title: "Tus derechos", note: "Acceso, corrección, borrado y por dónde pedirlo." },
    ],
  },
  {
    id: "terminos",
    label: "Términos",
    kind: "El contrato",
    summary: "Qué incluye el servicio y qué se espera de cada parte.",
    route: "terms",
    status: "outline",
    sections: [
      { id: "servicio", title: "Qué incluye el servicio", note: "Alcance, límites y cómo se contrata." },
      { id: "uso", title: "Uso aceptable", note: "Lo que no está permitido hacer con la plataforma." },
      { id: "cambios", title: "Cambios de condiciones", note: "Cómo y cuándo se avisa de una modificación." },
    ],
  },
  {
    id: "cookies",
    label: "Cookies",
    kind: "Tu navegador",
    summary: "Qué se guarda en el navegador y cómo cambiarlo.",
    route: "cookies",
    status: "outline",
    sections: [
      { id: "necesarias", title: "Necesarias", note: "Sesión, seguridad y preferencias que no se pueden desactivar." },
      { id: "medicion", title: "Medición", note: "Opcionales: qué se mide y qué no." },
      { id: "control", title: "Cómo cambiar la elección", note: "Desde el banner, desde aquí y borrando los datos del sitio." },
    ],
  },
  {
    id: "ia",
    label: "Transparencia IA",
    kind: "Cómo decide LAIA",
    summary: "Qué prepara la IA, qué decides tú y dónde se pide permiso.",
    route: "ai",
    status: "outline",
    sections: [
      { id: "papel", title: "Qué hace LAIA y qué no", note: "Prepara y propone; no aprueba por su cuenta." },
      { id: "datos", title: "Qué datos usa", note: "Contexto de tu cuenta y qué no se envía al modelo." },
      { id: "supervision", title: "Dónde decides tú", note: "Los puntos de aprobación antes de actuar." },
    ],
  },
  {
    id: "confianza",
    label: "Confianza",
    kind: "Garantías",
    summary: "Compromisos verificables sobre datos, IA y disponibilidad.",
    route: "trust",
    status: "missing",
    sections: [],
  },
];

const DRAFT_NOTE = "Esquema de secciones. El texto jurídico no está aprobado: aquí no hay contenido que puedas citar.";
const MISSING_NOTE = "Este documento no está disponible todavía.";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

type CookieChoice = { measurement: boolean; savedAt: string } | null;
const COOKIE_KEY = "agente_cookies_v1";

function readCookieChoice(): CookieChoice {
  try {
    const raw = window.localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { measurement?: boolean; savedAt?: string };
    if (typeof parsed.measurement !== "boolean") return null;
    return { measurement: parsed.measurement, savedAt: parsed.savedAt ?? "" };
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function LegalV1() {
  const [docId, setDocId] = useState<string>("aviso-legal");
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("");
  const [copyState, setCopyState] = useState<{ hash: string; ok: boolean } | null>(null);
  const [choice, setChoice] = useState<CookieChoice>(null);
  const [measurement, setMeasurement] = useState(false);
  const [iaOpen, setIaOpen] = useState(false);
  const [inviteNotice, setInviteNotice] = useState(false);

  const readerRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  const doc = documents.find((item) => item.id === docId) ?? documents[0];
  const routes = routeTable();
  const origin = new URL(routes.notice).origin;

  useEffect(() => {
    setChoice(readCookieChoice());
    return () => window.clearTimeout(copyTimer.current);
  }, []);

  const sections = doc.status === "outline"
    ? doc.sections.filter((section) => {
        if (!query.trim()) return true;
        return normalize(`${section.title} ${section.note}`).includes(normalize(query));
      })
    : [];

  // Índice con sección activa: el lector sabe dónde está sin adivinar.
  useEffect(() => {
    if (doc.status !== "outline" || typeof IntersectionObserver === "undefined") {
      setActiveSection("");
      return;
    }
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
  }, [doc.id, doc.status, query]);

  const scrollToReader = useCallback(() => {
    readerRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }, []);

  const selectDoc = (id: string, options?: { scroll?: boolean }) => {
    if (id === docId) {
      if (options?.scroll) scrollToReader();
      return;
    }
    setDocId(id);
    setQuery("");
    setCopyState(null);
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

  const openPreferences = () => {
    setMeasurement(choice?.measurement ?? false);
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
  };

  const saveChoice = (value: boolean) => {
    const next: CookieChoice = { measurement: value, savedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(COOKIE_KEY, JSON.stringify(next));
    } catch {
      /* Sin almacenamiento: la elección vive solo en esta visita. */
    }
    setChoice(next);
    setMeasurement(value);
    dialogRef.current?.close();
  };

  const clearChoice = () => {
    try {
      window.localStorage.removeItem(COOKIE_KEY);
    } catch {
      /* Nada que borrar. */
    }
    setChoice(null);
  };

  return (
    <div className="agntia-workspace legal-v1">
      <a className="lg-skip" href="#documento">
        Ir al documento
      </a>

      <header className="lg-header">
        <div className="lg-wrap lg-header-inner">
          <a className="lg-brand" href={`${origin}/`} aria-label="AgntiaPro, sitio público">
            <BrandLockup markSize={32} />
          </a>
          <nav className="lg-header-nav" aria-label="Acciones de la página">
            <button type="button" className="lg-ghost" onClick={openPreferences}>
              Gestionar cookies
            </button>
            <a className="lg-pill" href={`${origin}/`}>
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
            <span className="lg-chip lg-chip-warn">
              <Info size={14} aria-hidden="true" />
              Textos en preparación
            </span>
            <span className="lg-meta-text">Sin fecha de vigencia: no hay documento aprobado que citar.</span>
          </div>
          <div className="lg-cover-actions">
            <button type="button" className="lg-cta" onClick={() => selectDoc("ia", { scroll: true })}>
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
                <button type="button" className="lg-cta lg-cta-sm" onClick={() => selectDoc("ia", { scroll: true })}>
                  Ver el esquema
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
                <span className="lg-status">Sin texto aprobado</span>
              </div>
            </article>

            <ul className="lg-doclist">
              {documents.map((item, position) => (
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
                    <span className={item.status === "missing" ? "lg-docrow-state is-missing" : "lg-docrow-state"}>
                      {item.status === "missing" ? "No disponible" : "Esquema"}
                    </span>
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
                <dd>{doc.status === "missing" ? "No disponible" : "Esquema de secciones"}</dd>
              </div>
              <div>
                <dt>Ruta pública</dt>
                <dd>{routes[doc.route].replace(/^https?:\/\//, "")}</dd>
              </div>
              <div>
                <dt>Vigencia</dt>
                <dd>Sin fecha aprobada</dd>
              </div>
            </dl>
          </div>

          {doc.status === "missing" ? (
            <div className="lg-empty">
              <FileText size={22} aria-hidden="true" />
              <h3>{MISSING_NOTE}</h3>
              <p>
                La ruta está declarada en el sitio público, pero no hay página publicada ni texto aprobado. No
                se ha inventado contenido para rellenar el hueco.
              </p>
              <a className="lg-cta-ghost" href="#documentos">
                Volver al índice de documentos
              </a>
            </div>
          ) : (
            <>
              <div className="lg-toolbar">
                <label className="lg-search">
                  <Search size={16} aria-hidden="true" />
                  <span className="lg-sr">Buscar secciones de este documento</span>
                  <input
                    type="search"
                    value={query}
                    placeholder="Buscar en las secciones"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query && (
                    <button type="button" className="lg-search-clear" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </label>
                <p className="lg-toolbar-note" aria-live="polite">
                  {query
                    ? `${sections.length} de ${doc.sections.length} secciones coinciden`
                    : `${doc.sections.length} secciones · sin texto aprobado`}
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
                          className={query && !sections.some((item) => item.id === section.id) ? "is-dimmed" : undefined}
                        >
                          <span>{String(position + 1).padStart(2, "0")}</span>
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                  <p className="lg-aside-foot">
                    <Info size={13} aria-hidden="true" />
                    Índice real del documento: se resalta la sección que estás leyendo.
                  </p>
                </aside>

                <div className="lg-article" ref={articleRef}>
                  <p className="lg-draft-note">{DRAFT_NOTE}</p>

                  {sections.length === 0 ? (
                    <div className="lg-empty lg-empty-sm">
                      <Search size={20} aria-hidden="true" />
                      <h3>Ninguna sección coincide con «{query.trim()}»</h3>
                      <p>La búsqueda solo recorre los títulos y el resumen de cada sección de este documento.</p>
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
                              <p className="lg-section-note">{section.note}</p>
                              <p className="lg-pending">Texto pendiente de validación jurídica.</p>
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
            </>
          )}
        </section>

        <section className="lg-wrap lg-banners" id="banners" aria-labelledby="lg-banners-title">
          <p className="lg-kicker">Componentes reutilizables</p>
          <h2 id="lg-banners-title" className="lg-section-title">
            Banners honestos, sin letra pequeña
          </h2>
          <p className="lg-banners-lead">
            Tres piezas con el mismo lenguaje visual. Cada botón hace lo que dice: guarda una elección real,
            abre una explicación o declara que el servicio no está conectado.
          </p>

          <div className="lg-banner-grid">
            <article className="lg-banner lg-banner-cookies">
              <p className="lg-banner-kicker">Cookies</p>
              <h3>Usamos cookies para que todo funcione mejor</h3>
              <p className="lg-banner-text">
                Las necesarias no se pueden desactivar. Las de medición son opcionales y puedes cambiarlas
                cuando quieras.
              </p>
              <div className="lg-banner-actions">
                <button type="button" className="lg-cta lg-cta-sm lg-cta-ink" onClick={() => saveChoice(false)}>
                  Solo esenciales
                </button>
                <button type="button" className="lg-cta-ghost lg-cta-ghost-sm" onClick={openPreferences}>
                  Preferencias
                </button>
              </div>
              <p className="lg-banner-state" role="status">
                {choice
                  ? `Guardada en este navegador · medición ${choice.measurement ? "activada" : "desactivada"}`
                  : "Sin elección guardada en este navegador"}
                {choice && (
                  <button type="button" className="lg-linkish" onClick={clearChoice}>
                    Borrar
                  </button>
                )}
              </p>
            </article>

            <article className="lg-banner lg-banner-ai">
              <p className="lg-banner-kicker">
                <Sparkles size={14} aria-hidden="true" />
                Inteligencia artificial
              </p>
              <h3>LAIA ya preparó tu borrador</h3>
              <p className="lg-banner-text">
                Revisa, ajusta y aprueba cuando esté listo. Nada se envía sin ti.
              </p>
              <button
                type="button"
                className="lg-cta lg-cta-sm"
                aria-expanded={iaOpen}
                aria-controls="lg-ai-steps"
                onClick={() => setIaOpen((value) => !value)}
              >
                {iaOpen ? "Ocultar los pasos" : "Ver cómo funciona"}
              </button>
              {iaOpen && (
                <ol className="lg-ai-steps" id="lg-ai-steps">
                  <li>LAIA lee el contexto de tu cuenta.</li>
                  <li>Prepara el borrador y señala lo que no puede resolver sola.</li>
                  <li>Se queda esperando tu aprobación antes de actuar.</li>
                </ol>
              )}
            </article>

            <article className="lg-banner lg-banner-invite">
              <p className="lg-banner-kicker">Invitación</p>
              <h3>Invita a tu equipo a trabajar con LAIA</h3>
              <p className="lg-banner-text">Cada persona ve su trabajo. Tú mantienes el control.</p>
              <button
                type="button"
                className="lg-cta lg-cta-sm lg-cta-light"
                aria-expanded={inviteNotice}
                onClick={() => setInviteNotice((value) => !value)}
              >
                Preparar invitación
              </button>
              {inviteNotice && (
                <p className="lg-banner-notice" role="status">
                  El servicio de invitaciones no está conectado en esta maqueta. No se ha enviado nada.
                </p>
              )}
            </article>
          </div>

          <p className="lg-banners-foot">
            <ShieldCheck size={15} aria-hidden="true" />
            La elección de cookies se guarda solo en este navegador: no hay backend de consentimiento
            conectado.
          </p>
        </section>
      </main>

      <footer className="lg-footer">
        <div className="lg-wrap lg-footer-inner">
          <p>© 2026 AgntiaPro · UI Lab</p>
          <ul className="lg-footer-links">
            {documents.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => selectDoc(item.id, { scroll: true })}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </footer>

      <dialog
        ref={dialogRef}
        className="lg-dialog"
        aria-labelledby="lg-dialog-title"
        onClose={() => setMeasurement(choice?.measurement ?? false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="lg-dialog-inner">
          <div className="lg-dialog-head">
            <h2 id="lg-dialog-title">Preferencias de cookies</h2>
            <button
              type="button"
              className="lg-icon-btn"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar preferencias"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          <p className="lg-dialog-lead">
            Necesarias siempre activas. La medición es opcional y se guarda solo en este navegador.
          </p>
          <ul className="lg-prefs">
            <li>
              <label className="lg-pref">
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Necesarias</strong>
                  <em>Sesión, seguridad y esta misma preferencia. No se pueden desactivar.</em>
                </span>
              </label>
            </li>
            <li>
              <label className="lg-pref">
                <input
                  type="checkbox"
                  checked={measurement}
                  onChange={(event) => setMeasurement(event.target.checked)}
                />
                <span>
                  <strong>Medición</strong>
                  <em>Saber qué páginas se leen. Nada de publicidad ni de perfiles.</em>
                </span>
              </label>
            </li>
          </ul>
          <div className="lg-dialog-actions">
            <button type="button" className="lg-cta-ghost" onClick={() => saveChoice(false)}>
              Solo esenciales
            </button>
            <button type="button" className="lg-cta lg-cta-sm" onClick={() => saveChoice(measurement)}>
              Guardar elección
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
