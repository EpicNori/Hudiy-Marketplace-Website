# OBD2 Marketplace plugin limits

An OBD2 dashboard contribution is a declarative Hudiy WebView package. It is not an installer for the OBD2 backend.

## Supported package

The package may contain HTML, CSS, JavaScript, images, fonts, and other static assets required by the six dashboard presets:

- Load (%)
- Engine temperature (°C)
- RPM
- Speed
- Intake temperature (°C)
- Throttle (%)

The WebView reads the already-installed OBD2 backend through its documented local API at `127.0.0.1:44411`. The exact API response contract must be documented in the package README and handled defensively when data is unavailable.

## Explicitly unsupported

The package must not contain or execute Python, Flask, shell scripts, native binaries, systemd units, package-manager commands, autostart hooks, or direct Hudiy JSON modifications. It must not install, start, stop, configure, or replace the OBD2 backend.

## Device prerequisite

The OBD2 backend must already be installed and running before the package is tested or installed. If `127.0.0.1:44411` is unavailable, report a failed prerequisite; do not add an installer to the Marketplace package.
