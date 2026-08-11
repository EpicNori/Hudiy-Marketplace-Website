# Marketplace Website Design QA

## Source visual truth

- User-provided Hudiy reference: `C:\Users\norie\AppData\Local\Temp\codex-clipboard-21695767-8a73-4697-bfb8-9b4285237bd1.png`
- Reference language: near-black brown surfaces, warm cream typography, amber highlights, compact rectangular controls, and low visual noise.

## Implementation evidence

- URL: `http://127.0.0.1:4175/` (fresh production preview)
- State: dark mode, Firebase configuration present in `.env.local`, GitHub submission flow configured.
- The live browser capture was inspected at the default 1280 × 720 CSS viewport on 2026-08-11.

## Comparison

The website uses the same dark-brown/cream/amber palette as the supplied Hudiy dashboard. The hero panel, search controls, catalog cards, guide cards, upload panel, and header now use compact surfaces, reduced radii, restrained borders, and minimal shadow. The website keeps its own marketplace information architecture because the reference is a dashboard rather than a catalog. Firebase is now the active backend contract.

Light mode remains available through the header toggle, while dark mode is the default for new visitors and matches the plugin.

## Primary interactions tested

- Catalog search and category filter update the visible result state.
- The Website mirrors the Marketplace filter set and order: `Alle`, `Apps`, `Widgets`, `Overlays`, `Dashboards`.
- The visible `Anmelden` header button opens only the separate Firebase login dialog; after authentication it opens the separate account-management dialog.
- The `Einreichen` button opens only the GitHub submission dialog and links unauthenticated users back to login instead of embedding auth fields.
- Missing Firebase configuration produces an explicit setup message instead of silently using Supabase or making unauthenticated writes.
- Firebase build includes email/password and Google provider paths; repository submissions validate a public GitHub `manifest.json` and write only a pending Firestore record.
- A real public declarative fixture repository was submitted successfully with an isolated Firebase test account; see `docs/WEBSITE_SUBMISSION_TEST_REPORT_2026-08-11.md`.
- Theme toggle switches between the dark Hudiy palette and the light fallback palette.
- Vite production build completes successfully.

## Findings

No actionable P0, P1, or P2 findings remain in the configured-client flow. Firebase Web configuration is present in local and Vercel environments. The live Firestore submission passed with the configured rules and isolated test account; the submission flow deliberately does not use Firebase Storage.

## Final result

passed; live submission test passed

