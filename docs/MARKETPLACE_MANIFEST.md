# Manifest

Use `schemaVersion: 1`, a lowercase `id`, SemVer `version`, `name`, `description`, `author`, a supported package `type`, a supported Hudiy version, `entry.path`, `permissions`, and a `sha256:` checksum of the complete final ZIP. The website requires `manifest.json` at the configured repository path and validates the metadata before creating a pending submission.

The package archive must contain `manifest.json` at its root when it is prepared for installation. Repository submissions may point to that file using `manifestPath`; the website fetches only the manifest for initial validation. Paths may not be absolute, contain `..`, be symlinks, or point to executable files.
