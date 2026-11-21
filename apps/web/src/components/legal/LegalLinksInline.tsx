import LegalExternalLink from "./LegalExternalLink";

export default function LegalLinksInline() {
  return (
    <nav className="legal-links" aria-label="Información legal">
      <p>Consulta nuestra Política de privacidad y los Términos del servicio.</p>
      <LegalExternalLink page="privacy">Privacidad</LegalExternalLink>
      <LegalExternalLink page="terms">Términos</LegalExternalLink>
      <LegalExternalLink page="cookies">Cookies</LegalExternalLink>
    </nav>
  );
}
