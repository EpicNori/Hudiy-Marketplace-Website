# Creating packages

Create a public GitHub repository containing a declarative HTML/CSS/JavaScript package, static assets, `manifest.json`, README, and `style.md`. The installable archive contains `manifest.json` at its root and a relative entry under `app/`, `widget/`, `overlay/`, or the declared package path.

Do not include shell scripts, Python, Flask, native binaries, systemd units, package-manager commands, absolute paths, symlinks, automatic startup hooks, or code that edits Hudiy JSON directly. Local development/build commands may be used by the author outside the package, but they must not be shipped in the package or run by Hudiy.

Calculate the SHA-256 checksum only after the final ZIP is complete, put it in the manifest, and submit the public GitHub repository URL, revision, and manifest path through the Marketplace Website. For OBD2 dashboards, document the required existing backend/API and read it only at the declared local endpoint; never install the backend from the package.
