FROM node:22.22.0-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends bash python3 python3-pip git coreutils \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /opt/openmuse /opt/wheels /workspace \
    && chown 1000:1000 /workspace

COPY files.py /opt/openmuse/files.py
RUN chmod 0555 /opt/openmuse/files.py

# Offline wheels for skill dependencies. Add .whl files to apps/computer/wheels/ and
# rebuild; ensureSkill installs them with pip install --no-index --find-links=/opt/wheels.
COPY wheels/ /opt/wheels/
RUN chmod 0444 /opt/wheels/* 2>/dev/null || true

ENV HOME=/workspace LANG=C.UTF-8 \
    PIP_NO_INDEX=1 \
    PIP_FIND_LINKS=/opt/wheels \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /workspace
USER 1000:1000
VOLUME ["/workspace"]
ENTRYPOINT ["/usr/bin/sleep"]
CMD ["infinity"]