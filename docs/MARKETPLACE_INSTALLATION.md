# Installation

Installation is performed on the Hudiy device by the trusted Marketplace installation boundary. The website provides published metadata and a GitHub source reference; it never executes, extracts, or copies package files on the device.

The Marketplace host installer and any native Bridge are infrastructure for the Marketplace itself, not community-plugin contents. A valid community package must not contain a bridge binary, Python service, shell installer, systemd unit, package-manager command, or autostart hook.

After explicit user confirmation, the installation boundary resolves the approved GitHub revision or published package artifact, verifies the final ZIP checksum and manifest, rejects traversal/symlinks/executable files, installs the isolated declarative package, and updates only its own Hudiy registration entries. An OBD2 dashboard package assumes the separate backend already exists and does not install or configure it.
