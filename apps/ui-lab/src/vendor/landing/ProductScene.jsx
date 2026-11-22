import { BrandLockup } from "../components/BrandMark";
import {
  Check,
  CheckCheck,
  FileText,
  Folder,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const productViews = [
  {
    label: "Centro de Mando",
    icon: LayoutDashboard,
    title: "Lo importante, antes que lo urgente.",
    text: "Prioridades, trabajo en marcha y decisiones pendientes. Una vista clara para dirigir tu empresa.",
    detail: "LAIA reúne el contexto. Tú decides el siguiente paso.",
  },
  {
    label: "Conversación",
    icon: MessageCircle,
    title: "Pídelo como lo contarías.",
    text: "Una conversación para dar contexto, delegar trabajo y seguir el resultado. Sin saltar entre herramientas.",
    detail: "De una petición a un plan que puedes revisar.",
  },
  {
    label: "Operaciones",
    icon: CheckCheck,
    title: "Cada encargo tiene un camino.",
    text: "Tareas, responsables y aprobaciones en el mismo lugar. Para saber qué está hecho y qué necesita tu atención.",
    detail: "El trabajo avanza. Las decisiones siguen siendo tuyas.",
  },
  {
    label: "Workspaces",
    icon: Folder,
    title: "Tu empresa, con su propio contexto.",
    text: "Clientes, proyectos y documentos organizados por área. El equipo trabaja con tu forma de hacer las cosas.",
    detail: "Todo conectado, con el contexto de cada proyecto.",
  },
];

export default function ProductScene({ view }) {
  if (view === 0)
    return (
      <div className="lp-product-art">
        <img
          src="/landing/product-dimension.webp"
          width="1536"
          height="1024"
          loading="lazy"
          alt="Concepto visual del Centro de Mando de AgntiaPro, con el resumen de LAIA y una propuesta pendiente de aprobación en tarjetas con profundidad"
        />
      </div>
    );
  return (
    <div className="lp-product-scene" key={view}>
      <div className="lp-scene-window">
        <div className="lp-scene-top">
          <BrandLockup markSize={23} />
          <span>Espacio de demostración</span>
          <span className="lp-scene-avatar">Tú</span>
        </div>
        <div className="lp-scene-body">
          <aside aria-hidden="true">
            <LayoutDashboard />
            <MessageCircle />
            <CheckCheck />
            <Folder />
            <span className="lp-scene-bottom">
              <Sparkles />
            </span>
          </aside>
          {view === 1 && (
            <div className="lp-scene-chat">
              <span className="lp-micro">CONVERSACIÓN CON LAIA</span>
              <div className="lp-scene-user">Prepara el seguimiento de los clientes de esta semana.</div>
              <div className="lp-scene-response">
                <span className="lp-spark">
                  <Sparkles size={18} />
                </span>
                <div>
                  <strong>De acuerdo. Vamos por partes.</strong>
                  <p>
                    Organizo los contactos y preparo un borrador para cada cliente. Tú revisas los mensajes antes de
                    enviarlos.
                  </p>
                  <div className="lp-plan">
                    <span>
                      <Check size={15} /> Revisar el contexto
                    </span>
                    <span>
                      <Check size={15} /> Preparar los borradores
                    </span>
                    <span>
                      <ShieldCheck size={15} /> Esperar tu aprobación
                    </span>
                  </div>
                </div>
              </div>
              <div className="lp-scene-input">
                Cuéntale a LAIA qué necesitas…
                <MessageCircle size={18} />
              </div>
            </div>
          )}
          {view === 2 && (
            <div className="lp-scene-ops">
              <div className="lp-scene-heading">
                <h3>Del encargo al resultado.</h3>
                <span className="lp-tag">Esta semana</span>
              </div>
              <div className="lp-kanban">
                {[
                  { title: "Por preparar", items: ["Propuesta · Estudio Lumen", "Revisión de documentos"] },
                  { title: "En marcha", items: ["Seguimiento de clientes", "Resumen de tesorería"] },
                  { title: "Tu aprobación", items: ["Mensaje de seguimiento", "Propuesta comercial"] },
                ].map((col, c) => (
                  <div key={col.title}>
                    <h4>
                      <i className={`lp-column-dot lp-column-${c}`} />
                      {col.title}
                    </h4>
                    {col.items.map((item, i) => (
                      <div className="lp-task" key={item}>
                        <span className="lp-task-label">{i ? "GESTIÓN" : "CLIENTES"}</span>
                        <strong>{item}</strong>
                        <div>
                          <span className="lp-initial">{i ? "A" : "L"}</span>
                          <span>{i ? "Antonio" : "LAIA"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {view === 3 && (
            <div className="lp-scene-workspaces">
              <div className="lp-scene-heading">
                <h3>Un lugar para cada proyecto.</h3>
                <span className="lp-tag">Tu empresa</span>
              </div>
              <div className="lp-folders">
                {[
                  { name: "Clientes", count: "Conversaciones y seguimiento", icon: MessageCircle },
                  { name: "Finanzas", count: "Documentos y contexto", icon: FileText },
                  { name: "Proyectos", count: "Equipo y próximos pasos", icon: Folder },
                ].map(({ name, count, icon: Icon }) => (
                  <div key={name}>
                    <Icon size={27} />
                    <strong>{name}</strong>
                    <span>{count}</span>
                    <div className="lp-folder-line" />
                    <small>Contexto compartido</small>
                  </div>
                ))}
              </div>
              <div className="lp-workspace-note">
                <ShieldCheck size={20} />
                <span>Acceso y permisos definidos para cada área.</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="lp-scene-float">
        <span className="lp-spark">
          <Sparkles size={20} />
        </span>
        <div>
          <strong>
            {view === 1
              ? "Una conversación. Un plan."
              : view === 2
                ? "Nada sensible, sin tu visto bueno."
                : "El contexto viaja con el trabajo."}
          </strong>
          <span>Coordinado por LAIA</span>
        </div>
        <Check className="lp-float-check" size={18} />
      </div>
    </div>
  );
}
