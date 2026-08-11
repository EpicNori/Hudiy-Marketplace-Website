# Marketplace architecture

The public site handles discovery, Firebase Authentication, GitHub-repository submission, and moderation-facing status. It does not upload package files to Firebase Storage and it never writes Hudiy files directly.

The active data flow is:

1. A contributor signs in with Firebase Authentication using Google or e-mail/password.
2. The contributor submits a public GitHub repository URL, branch/tag, and manifest path.
3. The website fetches the manifest from `raw.githubusercontent.com` and validates its schema, ID, version, supported Hudiy version, and package type.
4. Firestore stores an owner-scoped `submissions/{submissionId}` document with `status: "pending"` and the GitHub source metadata.
5. Moderation reviews the repository at the submitted revision and creates or updates a published `plugins/{pluginId}` document.
6. The Hudiy Marketplace may install the published declarative package through its trusted installation boundary.

Firebase Storage is not part of the submission flow. A public GitHub repository is the source of truth for the package; the repository may contain the final ZIP and checksum used by the moderation/install process.
