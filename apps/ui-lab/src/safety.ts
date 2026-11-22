/**
 * UI Lab is a read-only visual environment.
 * All same-origin /api requests are denied before importing production components.
 * No backend tokens or customer credentials should be provided to this app.
 */
const originalFetch=window.fetch.bind(window);
window.fetch=(input:RequestInfo|URL,init?:RequestInit)=>{
  const url=typeof input==="string"?input:input instanceof URL?input.href:input.url;
  const parsed=new URL(url,window.location.href);
  if(parsed.origin===window.location.origin&&(/^\/api(?:\/|$)/).test(parsed.pathname)){
    return Promise.reject(new Error("UI Lab: API desactivada; vista sin conexión"));
  }
  return originalFetch(input,init);
};
