# Bridge contract

The optional native Marketplace Bridge is a trusted device-side installation component, not a Marketplace package. It exposes authenticated loopback endpoints for health, status, installed packages, install, update, uninstall, and reload. The website/WebView does not execute shell commands or assume an undocumented `window.hudiy.installMarketplacePlugin` function.

The Bridge must reject any package that contains shell scripts, Python, Flask, native binaries, systemd units, package-manager commands, absolute paths, symlinks, executable startup hooks, or other non-declarative content. It must validate the GitHub revision/package URL, manifest, checksum, size, paths, permissions, and ownership before changing Hudiy files.
