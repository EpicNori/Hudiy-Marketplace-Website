# Hudiy Marketplace Website

Public community website for discovering Hudiy plugins, widgets and configs, reading setup guides, and submitting GitHub repositories for moderation.

## Firebase architecture

- Firebase Authentication: Google OAuth and e-mail/password login.
- Cloud Firestore: published `plugins` catalogue and owner-scoped `submissions`.
- GitHub repositories: the creator's public repository is the package source; the website validates the referenced manifest before creating a submission.
- Firebase Hosting: Vite `dist` output with an SPA rewrite.
- Firebase Security Rules: public reads are limited to published plugins; users can create only their own pending GitHub submissions.

The browser never contains a service-account key. Publishing, moderation and moving files into the public `plugins` path must happen through a trusted Firebase Admin process or the Firebase console.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Fill the `VITE_FIREBASE_*` values in `.env.local` with the Firebase Web App configuration. These values are intended for the browser; never put a service-account JSON or private key into `.env.local` or Vercel.

Enable these Firebase Authentication providers:

- Google
- Email/password

The Firebase project must also have Cloud Firestore enabled. Storage is not required for the GitHub-based submission flow. Deploy the rules and Hosting configuration with the Firebase CLI:

```bash
firebase login
firebase use your-firebase-project-id
firebase deploy --only firestore:rules,hosting
```

The public Vercel deployment can continue to serve the Vite build, but Firebase Hosting is the canonical deployment target after this migration. If both are used, configure the same Firebase Web App environment values in both hosts.

## Data contract

Published catalogue documents live in `plugins/{pluginId}` and need at least `status: "published"`, `name`, `description`, `author`, `version` and `type`.

User submissions are written to `submissions/{submissionId}` with `status: "pending"`, `ownerId`, `pluginId`, `repoUrl`, `repoOwner`, `repoName`, `repoRef`, `manifestPath`, `manifestUrl`, and the validated manifest metadata. The client fetches `manifest.json` from `raw.githubusercontent.com` and rejects private, non-GitHub, malformed, or invalid repositories. The client does not have permission to publish, update or delete submissions.

Each public repository must contain a manifest with this minimum shape:

```json
{
  "schemaVersion": 1,
  "id": "my-hudiy-plugin",
  "name": "My Hudiy Plugin",
  "description": "A short description.",
  "author": "Your GitHub name",
  "version": "1.0.0",
  "supportedHudiyVersion": ">=1.0.0"
}
```

The former Supabase files remain in the repository as legacy migration material, but the website client no longer calls Supabase.

## License

MIT
