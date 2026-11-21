import type { ReactNode } from "react";
import { legalUrl, type legalPages } from "../../config/publicSite";

export default function LegalExternalLink({ page, children, className }: {
  page: keyof typeof legalPages;
  children: ReactNode;
  className?: string;
}) {
  return <a className={className} href={legalUrl(page)} target="_blank" rel="noopener noreferrer">{children}</a>;
}
