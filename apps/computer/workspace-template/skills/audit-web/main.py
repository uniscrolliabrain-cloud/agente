#!/usr/bin/env python3
"""Website audit.

Two modes:

  --stdin   Read JSON from stdin: {url, html, title, final_url}.
            Analyzes HTML that another tool already fetched (e.g. read_web).
            This is the supported path inside the sandbox, which has no network.

  --url     Fetch over the network. Works on a host with egress; fails honestly
            inside the sandbox with a network error.
"""
import argparse
import json
import re
import socket
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


def analyze_html(url: str, html: str, title: str = "", final_url: str = "") -> dict:
    lowered = html.lower()
    resolved = final_url or url
    result: dict = {
        "url": url,
        "final_url": resolved,
        "https": resolved.startswith("https://"),
        "size_kb": len(html) // 1024,
    }
    if not title:
        m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
        title = m.group(1).strip()[:200] if m else ""
    result["title"] = title
    result["has_viewport"] = 'name="viewport"' in lowered
    result["has_og"] = 'property="og:' in lowered
    result["has_meta_description"] = 'name="description"' in lowered
    result["has_canonical"] = 'rel="canonical"' in lowered
    result["has_hreflang"] = "hreflang=" in lowered
    result["h1_count"] = len(re.findall(r"<h1[\s>]", lowered))
    result["img_count"] = len(re.findall(r"<img[\s>]", lowered))
    result["img_without_alt"] = len(re.findall(r"<img(?![^>]*\balt=)[^>]*>", lowered))
    return result


def audit_remote(domain: str) -> dict:
    if "://" not in domain:
        domain = "https://" + domain
    result: dict = {"domain": domain}
    try:
        request = urllib.request.Request(
            domain, method="GET", headers={"User-Agent": "OpenMuse-Audit/1.0"}
        )
        started = time.monotonic()
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read(200_000).decode("utf-8", errors="replace")
            headers = {k.lower(): v for k, v in response.getheaders()}
            result.update(analyze_html(url=domain, html=body, final_url=response.geturl()))
            result["status"] = response.status
            result["elapsed_ms"] = int((time.monotonic() - started) * 1000)
            result["server"] = headers.get("server", "")
            result["strict_transport_security"] = "strict-transport-security" in headers
            result["content_security_policy"] = "content-security-policy" in headers
    except urllib.error.HTTPError as exc:
        result["status"] = exc.code
        result["error"] = "HTTP " + str(exc.code)
    except urllib.error.URLError as exc:
        result["error"] = "URL error: " + str(exc.reason)
    except socket.timeout:
        result["error"] = "timeout"
    except Exception as exc:
        result["error"] = type(exc).__name__ + ": " + str(exc)
    try:
        host = urllib.parse.urlparse(domain).hostname
        if host:
            ctx = ssl.create_default_context()
            with socket.create_connection((host, 443), timeout=5) as sock:
                with ctx.wrap_socket(sock, server_hostname=host) as tls:
                    cert = tls.getpeercert()
                    result["cert_expires"] = cert.get("notAfter", "")
    except Exception:
        pass
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("domain", nargs="?")
    parser.add_argument("--url")
    parser.add_argument("--stdin", action="store_true")
    args = parser.parse_args()

    if args.stdin:
        try:
            payload = json.loads(sys.stdin.read() or "{}")
        except json.JSONDecodeError as exc:
            print(json.dumps({"error": "invalid stdin JSON: " + str(exc)}))
            return 1
        url = str(payload.get("url") or payload.get("final_url") or "")
        html = str(payload.get("html") or "")
        if not html:
            print(
                json.dumps(
                    {
                        "error": "stdin mode requires an 'html' field; the sandbox has no network egress, use read_web first",
                        "url": url,
                    }
                )
            )
            return 1
        print(
            json.dumps(
                analyze_html(
                    url=url,
                    html=html,
                    title=str(payload.get("title") or ""),
                    final_url=str(payload.get("final_url") or ""),
                ),
                ensure_ascii=False,
            )
        )
        return 0

    target = args.url or args.domain
    if not target:
        print(json.dumps({"error": "provide --url, a positional domain, or --stdin"}))
        return 1
    print(json.dumps(audit_remote(target), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())