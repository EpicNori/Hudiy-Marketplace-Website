# Device testing

Before release, test the Marketplace host installation and trusted installation boundary on real Hudiy hardware with an application, dashboard widget, overlay, update, checksum rejection/rollback, uninstall, JSON validation, and preservation of unrelated entries.

For every community package, test the public GitHub repository revision, manifest fetch, final ZIP checksum, path traversal/symlink rejection, and rejection of shell/Python/native/systemd/package-manager content. For an OBD2 dashboard, separately verify that the expected OBD2 backend is already installed and that the six gauges/charts can read `127.0.0.1:44411`; the package test must also prove that it does not install, start, stop, or modify that backend.

The test report must record the repository URL, commit/ref, manifest checksum, package type, Hudiy version, permissions, backend precondition, device result, and rollback result. A missing OBD2 backend is a failed prerequisite, not a reason to add an installer to the Marketplace package.
