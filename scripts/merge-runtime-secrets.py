"""Merge named GitHub application settings into the Doppler JSON stdin stream.

Used only in a pipe to flyctl; never log this stream or read all of the runner's
credentials. Empty GitHub bindings preserve existing Doppler/crypto/DSN values.
"""
import json
import os
import sys

BINDINGS = {
    "RUNTIME_GH_OPENROUTER_API_KEY": "OPENROUTER_API_KEY",
    "RUNTIME_GH_OPEN_ROUTER_API_KEY": "OPEN_ROUTER_API_KEY",
    "RUNTIME_GH_SUPABASE_SECRET": "SUPABASE_SECRET_KEY",
    "RUNTIME_GH_GRAFANA_URL": "GRAFANA_URL",
    "RUNTIME_GH_GRAFANA_SERVICE_ACCOUNT_TOKEN": "GRAFANA_SERVICE_ACCOUNT_TOKEN",
    "RUNTIME_GH_GRAFANA_CLOUD_TOKEN": "GRAFANA_CLOUD_TOKEN",
    "RUNTIME_GH_SENTRY_DSN": "SENTRY_DSN",
}
try:
    data = json.load(sys.stdin)
    if not isinstance(data, dict) or any(not isinstance(k, str) or not isinstance(v, str) for k, v in data.items()):
        raise ValueError("invalid mapping")
    for source, target in BINDINGS.items():
        value = os.environ.get(source)
        if value and value.strip():
            data[target] = value
    json.dump(data, sys.stdout)
except (ValueError, TypeError):
    sys.stderr.write("Runtime secret mapping invalid; values withheld\n")
    sys.exit(2)
