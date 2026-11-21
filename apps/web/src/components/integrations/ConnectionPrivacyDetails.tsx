import type { GoogleStatus } from "../../api/google";

export default function ConnectionPrivacyDetails({ connection }: { connection: GoogleStatus | null }) {
  return (
    <details className="connection-privacy">
      <summary>Permisos y uso de datos</summary>
      <p>Google Workspace permite al agente consultar correo, eventos y archivos para las tareas que solicites. La autorización de escritura solicita permisos de envío, modificación y gestión de Gmail, Calendar y Drive.</p>
      {connection?.connected && !connection.sample && (
        <>
          <p>Autorizante: {connection.authorizer ? "tu cuenta de AgntiaPro" : "sin atribución verificada"}.</p>
          <p>Permisos concedidos:</p>
          <ul>{connection.scopes.map((scope) => <li key={scope}><code>{scope}</code></li>)}</ul>
          {!connection.scopes.length && <p>Permisos sin confirmar.</p>}
        </>
      )}
      <p>Región y plazos del proveedor pendientes de verificación. Si desconectas Google, la aplicación deja de usar esta conexión. Los datos ya tratados pueden conservarse.</p>
      <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">Gestionar acceso en Google</a>
    </details>
  );
}
