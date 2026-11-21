/// <reference types="vite/client" />

const canonicalSite = "https://agntiapro.com";

export const legalPages = {
  privacy: "privacidad.html",
  terms: "terminos.html",
  cookies: "cookies.html",
  ai: "transparencia-ia.html",
  trust: "confianza.html",
} as const;

export function publicSiteOrigin(configured?: string): string {
  if (!configured) return canonicalSite;
  try {
    const url = new URL(configured);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return canonicalSite;
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      return canonicalSite;
    }
    return url.origin;
  } catch {
    return canonicalSite;
  }
}

export function legalUrl(page: keyof typeof legalPages): string {
  return new URL(legalPages[page], publicSiteOrigin(import.meta.env.VITE_PUBLIC_SITE_URL)).href;
}
