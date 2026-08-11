# Hudiy Marketplace Website Style

## Current restyle — 2026-08-11

The public website follows the Hudiy dashboard language shown in the product reference: a quiet near-black brown canvas, warm cream typography, restrained amber actions, and compact rectangular panels. The page stays simple and content-first so the catalogue, login and upload actions remain easy to find on a touchscreen-sized viewport.

## Direction

The website is the public companion to the Hudiy WebView Marketplace. It uses a dark brown/black dashboard foundation with warm cream text, restrained amber controls, compact rectangular cards, and a technical editorial layout. A light mode is available through the header toggle. Firebase is the active backend for authentication, the published catalogue and GitHub-based submissions.

## Tokens

- `--bg: #0f0c09`: Hudiy-like page background
- `--surface: #17120e`, `--surface-2: #211910`, `--surface-3: #2a2017`: cards, panels, and raised controls
- `--text: #f2e8dc`, `--muted: #b7a899`: cream content hierarchy
- `--primary: #a66a11`, `--on-primary: #fff6e8`: amber actions and community accent
- `--line: #3b2c1d`: low-contrast separators
- `--accent: #d9bb92`: secondary cream accent
- `--danger: #d39a76`: safety warning state

All page colors use CSS custom properties. No catalog data is rendered as trusted HTML; text is escaped before cards are inserted.

## Layout

- Sticky compact header with brand, section navigation, visible login action and upload action.
- Responsive hero with the Hudiy community message and three trust/stat signals.
- Search and filter panel above a three-column desktop catalogue.
- Guides section for discovery, safety and contribution education.
- Upload call-to-action and persistent safety notice.
- Separate dialog surfaces for login, account management, and GitHub submission. The header's `Anmelden` button opens only the login dialog; after login it becomes `Konto`, while the submission dialog contains only repository fields and a link back to login.
- The catalogue filter row mirrors the Hudiy Marketplace exactly: `Alle`, `Apps`, `Widgets`, `Overlays`, and `Dashboards`.

## Firebase contract

The frontend uses the Firebase Web SDK with `VITE_FIREBASE_*` configuration. Firebase Authentication manages sessions and Firestore Rules protect the catalogue and submissions. A submission stores a public GitHub repository reference; package files are not copied into Firebase Storage. The website does not contain service-account credentials. See `firestore.rules` for the active authorization boundary.

