import { Component, type ReactNode } from "react";

/** A stale lazy-chunk URL during a rolling deploy must not blank the shell. */
export default class WorkspaceLoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert" style={{ padding: 28 }}>
        <h2>No se ha podido abrir el estudio</h2>
        <p>Recarga la aplicación para volver a intentarlo. El resto del menú sigue disponible.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 12,
            padding: "10px 18px",
            borderRadius: 8,
            border: 0,
            background: "#6550dd",
            color: "white",
            cursor: "pointer",
          }}
        >
          Recargar aplicación
        </button>
      </section>
    );
  }
}
