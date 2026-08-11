# Hudiy Marketplace Website Style

## Direction

The website is the public companion to the Hudiy WebView Marketplace. It uses a dark brown/black dashboard foundation with warm cream text, restrained amber controls, compact rectangular cards, and a technical editorial layout. A light mode is available through the header toggle.

## Tokens

- `--bg`: page background
- `--surface`, `--surface-2`, `--surface-3`: cards, panels, and raised controls
- `--text`, `--muted`: content hierarchy
- `--primary`, `--on-primary`: actions and community accent
- `--line`: borders and dividers
- `--accent`: secondary decorative accent
- `--danger`: safety warning state

All page colors use CSS custom properties. No catalog data is rendered as trusted HTML; text is escaped before cards are inserted.

## Layout

- Sticky compact header with brand, section navigation and upload action.
- Responsive hero with the Hudiy community message and three trust/stat signals.
- Search and filter panel above a three-column desktop catalogue.
- Guides section for discovery, safety and contribution education.
- Upload call-to-action and persistent safety notice.
- Dialog-based authentication and upload flow.

## Supabase contract

The frontend uses the existing `mdzsxuxqrhnadmkroalq` project through its publishable key. Authentication tokens are sent to Supabase REST and Storage endpoints; database and Storage RLS remain the authorization boundary. The website does not contain service-role credentials.
