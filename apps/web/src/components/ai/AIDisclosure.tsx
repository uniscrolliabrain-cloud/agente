import LegalExternalLink from "../legal/LegalExternalLink";

export default function AIDisclosure() {
  return (
    <p className="ai-disclosure">
      Estás conversando con LAIA, un sistema de inteligencia artificial.{" "}
      <LegalExternalLink page="ai">Transparencia IA</LegalExternalLink>
    </p>
  );
}
