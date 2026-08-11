# Security

The public site uses Firebase Web configuration values only. Firebase Authentication controls sessions and Firestore Rules allow public reads only for published catalogue records and authenticated users to create only their own pending GitHub submissions. Public Web SDK values belong in the host's build environment, not in the repository; no service-account key, private key, OAuth client secret, or Composio credential may enter the browser, repository, Netlify environment, or Hudiy WebView.

The client validates the GitHub host, repository shape, branch/tag, manifest path, manifest schema, package ID, and SemVer before writing Firestore. These checks improve feedback but are not moderation: the repository contents, final ZIP, checksum, permissions, and compatibility must be revalidated by a trusted moderation/device process.

Community packages are declarative HTML/CSS/JavaScript and static assets only. Shell commands, Python, Flask servers, native binaries, systemd units, package-manager commands, absolute paths, symlinks, and automatic startup hooks are rejected. The OBD2 backend is never installed by a package; OBD2 packages may only read an already-installed local API such as `127.0.0.1:44411`.

