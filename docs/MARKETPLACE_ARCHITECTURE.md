# Marketplace architecture

The public site handles discovery, authentication, upload submission, and moderation-facing status. Supabase Edge Functions validate uploads and create short-lived signed package URLs. The Hudiy Marketplace WebView passes those URLs to the local native Bridge; the site never writes Hudiy files directly.
