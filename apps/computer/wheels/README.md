# Bundled Python wheels

The computer sandbox has no network access by design. Skill dependencies are
installed offline from the wheels in this directory.

## Add a wheel

From any machine with network access:

    pip download <package>==<version> --only-binary=:all: --python-version 311 --platform manylinux2014_x86_64 -d apps/computer/wheels/

Then commit the resulting .whl files here and rebuild the computer image:

    docker build -t openmuse-computer:local apps/computer

## How it is used

When a SOP with skillId runs for the first time, ensureSkill reads the
skill requirements array and runs:

    python3 -m pip install --user --no-input --no-index --find-links=/opt/wheels <reqs>

- If every wheel is present, install succeeds silently.
- If any wheel is missing, the task fails with a message that names the missing
  requirement. Nothing is fetched from the network.
- Pure-Python wheels are portable. Native wheels must match the container ABI
  (cp311 + manylinux2014_x86_64).