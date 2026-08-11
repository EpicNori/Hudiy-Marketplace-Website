# Uninstallation

The Marketplace sends an authenticated uninstall request to the trusted local installation boundary. It removes only registry-owned entries and the isolated files belonging to the selected package version, while preserving other Hudiy configuration, Marketplace packages, and user-authored entries.

Uninstallation never removes or stops an external service. In particular, uninstalling an OBD2 dashboard package must not remove the separately installed OBD2 backend at `127.0.0.1:44411`.
