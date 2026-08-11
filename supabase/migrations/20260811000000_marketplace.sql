create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('plugin-packages', 'plugin-packages', false)
on conflict (id) do update set public = false;

create table if not exists public.plugins (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9._-]{0,63}$'), name text not null, description text not null, author text not null,
  author_user_id uuid not null references auth.users(id) on delete restrict, version text not null,
  type text not null check (type in ('application', 'dashboard', 'dashboard-widget', 'overlay', 'configuration', 'widget', 'app')),
  supported_hudiy_version text not null, permissions jsonb not null default '[]'::jsonb, entrypoints jsonb not null default '{}'::jsonb,
  files jsonb not null default '[]'::jsonb, checksum text not null, downloads integer not null default 0, rating numeric(3,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'withdrawn', 'rejected')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.plugin_versions (
  id uuid primary key default gen_random_uuid(), plugin_id text not null references public.plugins(id) on delete cascade, version text not null,
  storage_path text not null, checksum text not null, manifest jsonb not null default '{}'::jsonb, release_notes text not null default '',
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'withdrawn', 'rejected')),
  created_at timestamptz not null default now(), unique (plugin_id, version)
);

create table if not exists public.plugin_uploads (
  id uuid primary key default gen_random_uuid(), plugin_id text not null references public.plugins(id) on delete cascade, version text not null,
  uploader_user_id uuid not null references auth.users(id) on delete restrict, storage_path text not null, original_filename text not null,
  byte_size bigint not null, checksum text not null, validation_status text not null default 'pending_review', status text not null default 'pending_review',
  validation_errors jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);

alter table public.plugins enable row level security;
alter table public.plugin_versions enable row level security;
alter table public.plugin_uploads enable row level security;

drop policy if exists "published plugin catalogue is public" on public.plugins;
create policy "published plugin catalogue is public" on public.plugins for select using (status = 'published');
drop policy if exists "authors can read their plugins" on public.plugins;
create policy "authors can read their plugins" on public.plugins for select to authenticated using (author_user_id = auth.uid());
drop policy if exists "published versions are public" on public.plugin_versions;
create policy "published versions are public" on public.plugin_versions for select using (status = 'published');
drop policy if exists "authors can read their versions" on public.plugin_versions;
create policy "authors can read their versions" on public.plugin_versions for select to authenticated using (exists (select 1 from public.plugins p where p.id = plugin_id and p.author_user_id = auth.uid()));
drop policy if exists "authors can read their uploads" on public.plugin_uploads;
create policy "authors can read their uploads" on public.plugin_uploads for select to authenticated using (uploader_user_id = auth.uid());

drop policy if exists "authenticated users can upload their package" on storage.objects;
create policy "authenticated users can upload their package" on storage.objects for insert to authenticated with check (bucket_id = 'plugin-packages' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "users can remove their package" on storage.objects;
create policy "users can remove their package" on storage.objects for delete to authenticated using (bucket_id = 'plugin-packages' and (storage.foldername(name))[1] = auth.uid()::text);
