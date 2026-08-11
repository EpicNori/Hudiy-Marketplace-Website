# Hudiy Marketplace Website

Public community website for discovering Hudiy plugins, widgets and configs, reading setup guides, and submitting packages for review.

## Features

- Supabase-backed published catalogue with client-side search and type filters.
- E-mail/password login and Google OAuth through the existing Hudiy Marketplace Supabase project.
- Upload validation for manifest fields, ZIP extension, 50 MB size limit and SHA-256 checksum.
- Private `plugin-packages` Storage uploads and draft metadata protected by Supabase RLS.
- Static Vite build suitable for Vercel.
- MIT licensed.

## Development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SITE_URL` in Vercel. Only the publishable key belongs in this frontend; never expose a Supabase service-role key.

The website reuses project `mdzsxuxqrhnadmkroalq`. Configure the Vercel production URL in Supabase Auth URL Configuration and enable Google with its provider credentials before using Google login.
