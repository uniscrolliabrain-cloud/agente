import { ArrowUpRight, Lock, Sparkles } from "lucide-react";
import { COMPANY, REST_NOTIFICATIONS } from "./launcher-catalog";

type RestScreenProps = {
  now: Date;
  onUnlock: () => void;
  onOpenNotification: (appId: string) => void;
  onOpenLaia: () => void;
};

const dateFormat = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
const timeFormat = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false });

export function RestScreen({ now, onUnlock, onOpenNotification, onOpenLaia }: RestScreenProps) {
  return (
    <section className="alp-rest" aria-label="Pantalla de reposo">
      <div className="alp-rest-glow" aria-hidden="true" />
      <header className="alp-rest-top">
        <div className="alp-brand">
          <span className="alp-brand-mark" aria-hidden="true" />
          <span className="alp-brand-name">AgntiaPro</span>
        </div>
        <div className="alp-rest-company">
          <span>{COMPANY.name}</span>
          <span className="alp-dot" aria-hidden="true" />
          <span>{COMPANY.user}</span>
        </div>
      </header>

      <div className="alp-rest-center">
        <p className="alp-rest-kicker">Sistema operativo empresarial</p>
        <time className="alp-rest-clock" dateTime={now.toISOString()}>
          {timeFormat.format(now)}
        </time>
        <p className="alp-rest-date">{dateFormat.format(now)}</p>
        <p className="alp-rest-brief">
          Tres decisiones esperan tu criterio. El resto del día está en marcha.
        </p>
      </div>

      <ul className="alp-rest-notifications" aria-label="Notificaciones de la empresa">
        {REST_NOTIFICATIONS.map((item) => (
          <li key={item.title}>
            <button
              type="button"
              className="alp-notification"
              onClick={(event) => {
                event.stopPropagation();
                onOpenNotification(item.appId);
              }}
            >
              <span className="alp-notification-app">{item.app}</span>
              <span className="alp-notification-title">{item.title}</span>
              <span className="alp-notification-meta">{item.meta}</span>
              <ArrowUpRight size={15} aria-hidden="true" className="alp-notification-arrow" />
            </button>
          </li>
        ))}
      </ul>

      <footer className="alp-rest-bottom">
        <button
          type="button"
          className="alp-laia"
          onClick={(event) => {
            event.stopPropagation();
            onOpenLaia();
          }}
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>Preguntar a LAIA</span>
        </button>
        <button
          type="button"
          className="alp-unlock"
          onClick={(event) => {
            event.stopPropagation();
            onUnlock();
          }}
        >
          <Lock size={14} aria-hidden="true" />
          <span>Entrar al escritorio</span>
          <span className="alp-unlock-hint" aria-hidden="true">Intro</span>
        </button>
        <p className="alp-rest-hint" aria-hidden="true">Toca en cualquier punto o desliza hacia arriba</p>
      </footer>
    </section>
  );
}
