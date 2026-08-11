# GitHub repository submissions

The Website accepts a public GitHub repository as the source of a Marketplace contribution. It does not accept ZIP uploads and it does not copy repository files into Firebase Storage.

## Contributor flow

1. Create a public repository containing the declarative package, `manifest.json`, README, and `style.md`.
2. Push the final package and keep the repository revision stable while it is under review.
3. Sign in to the Website with Firebase Google or e-mail/password authentication.
4. Submit the canonical `https://github.com/<owner>/<repository>` URL, branch/tag, and manifest path.
5. The Website fetches the manifest from `raw.githubusercontent.com` and validates the basic schema.
6. Firestore creates an owner-scoped `submissions/{submissionId}` document with `status: "pending"`.

## Firestore submission shape

The client writes only the following submission metadata:

```text
submissionId, sourceType, pluginId, name, description, author, version,
ownerId, status, repoUrl, repoOwner, repoName, repoRef, manifestPath,
manifestUrl, createdAt
```

The client cannot publish, edit, or delete a submission. Moderation must inspect the repository, recalculate the final archive checksum, and publish only approved catalogue metadata.

## Security rules

Repositories must be public, use the GitHub host, and contain a valid manifest. Client-side validation is only an early rejection layer. It is not a security approval and must be repeated by moderation and the trusted Hudiy installation boundary.
