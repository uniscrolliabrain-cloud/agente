/**
 * UI Lab network guard. Defense in depth, not an authorization boundary.
 * Preview UI is served from an independent origin and must never receive
 * production credentials or be attached to a production backend.
 */
const originalFetch = window.fetch.bind(window);
const allowManifest = (url: string): boolean => {
  const target = new URL(url, window.location.href);
  return target.origin === window.location.origin && target.pathname === "/version.json";
};
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!allowManifest(url)) {
    return Promise.reject(new Error("UI Lab: peticiones de red deshabilitadas"));
  }
  return originalFetch(input, init);
};

// Disallow additional network APIs used by imported production components.
// CSP connect-src also provides browser-enforced protection.
const NativeXHR = window.XMLHttpRequest;
class BlockedXHR extends NativeXHR {
  override open(): void {
    throw new Error("UI Lab: XMLHttpRequest deshabilitado");
  }
}
window.XMLHttpRequest = BlockedXHR;
class BlockedWebSocket extends WebSocket {
  constructor(_url: string | URL, _protocols?: string | string[]) {
    super("ws://127.0.0.1:0");
    throw new Error("UI Lab: WebSocket deshabilitado");
  }
}
window.WebSocket = BlockedWebSocket;
class BlockedEventSource extends EventSource {
  constructor(_url: string | URL, _options?: EventSourceInit) {
    super("data:,");
    throw new Error("UI Lab: EventSource deshabilitado");
  }
}
window.EventSource = BlockedEventSource;
try {
  Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: () => false });
} catch {
  // The browser CSP still restricts outbound connections.
}
