# Publishing

An authenticated GitHub-repository submission enters Firestore with `status: "pending"`. The website stores `repoUrl`, `repoOwner`, `repoName`, `repoRef`, `manifestPath`, and `manifestUrl` together with the validated manifest metadata. It does not copy the repository or ZIP into Firebase Storage.

Moderation must review the public repository at the submitted revision, verify the manifest, inspect the declarative HTML/JavaScript package, recalculate the final ZIP checksum, and test it on a clean Hudiy device. Only moderation may create or promote a `plugins/{pluginId}` record to `status: "published"`; only published entries appear in the public catalogue.
