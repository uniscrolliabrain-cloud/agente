#!/usr/bin/env python3
"""Website audit using only Python stdlib."""
import argparse
import json
import re
import socket
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request

def audit(domain: str) -> dict:
    if "://" not in domain:
        domain = "https://" + domain
    result = {"domain": domain}
    try:
        request = urllib.request.Request(
            domain, method="GET", headers={"User-Agent": "OpenMuse-Audit/1.0"}
        )
        started = time.monotonic()
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read(200_000).decode("utf-8", errors="replace")
            result["status"] = response.status
            result["final_url"] = response.geturl()
            result["https"] = response.geturl().startswith("https://")
            result["elapsed_ms"] = int((time.monotonic() - started) * 1000)
            headers = {k.lower(): v for k, v in response.getheaders()}
            result["server"] = headers.get("server", "")
            result["strict_transport_security"] = "strict-transport-security" in headers
            result["content_security_policy"] = "content-security-policy" in headers
            title_match = re.search(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
            result["title"] = title_match.group(1).strip()[:200] if title_match else ""
            result["has_viewport"] = "name=" + chr(34) + "viewport" + chr(34) in body.lower()
            result["has_og"] = "property=" + chr(34) + "og:" in body.lower()
            result["size_kb"] = len(body) // 1024
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

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("domain")
    args = parser.parse_args()
    print(json.dumps(audit(args.domain), ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
