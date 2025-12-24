# EchoVerse

Progressive Web App setup
- Add to Home Screen on Android/iOS
- Standalone fullscreen after install
- Offline support with a service worker and offline fallback page

Replace icons and branding
- Place your app icons in `assets/` and update `manifest.json` if you change names.
- For best results provide PNG icons:
	- 192x192: `assets/icon-192.png`
	- 512x512: `assets/icon-512.png`
	- Optional maskable: `assets/icon-512-maskable.png`
- iOS home screen icon uses a PNG ~180x180 via `<link rel="apple-touch-icon" ...>`.

Files involved
- `manifest.json` – PWA metadata (name, colors, icons, start_url, shortcuts)
- `sw.js` – Service worker with precache + offline fallback
- `offline.html` – Shown when offline navigation fails
- `assets/sample.svg` – Temporary icon (replace with your own PNGs)

Local testing tips
- Use Chrome/Edge dev tools > Application > Manifest to verify PWA installability
- On iOS Safari use Share > Add to Home Screen

Vercel
- Static deploy from repo root. `vercel.json` routes `/` to `index.html`.

## Reactions (Supabase)

The app supports WhatsApp-style reactions with a long-press popover and compact chips under messages. Reactions are stored in `public.echo_reactions`.

Fresh install (UUID `echoes.id`). If your `echoes.id` is `bigint`, see the variant below.

```sql
-- Ensure extension for UUIDs
create extension if not exists pgcrypto;

create table if not exists public.echo_reactions (
	id uuid primary key default gen_random_uuid(),
	echo_id uuid not null references public.echoes(id) on delete cascade,
	emoji text not null check (char_length(emoji) > 0 and char_length(emoji) <= 8),
	device_id text not null,
	created_at timestamptz not null default now(),
	unique (echo_id, emoji, device_id)
);

-- Indexes
create index if not exists idx_echo_reactions_echo on public.echo_reactions(echo_id);
create index if not exists idx_echo_reactions_emoji on public.echo_reactions(emoji);
create index if not exists idx_echo_reactions_echo_emoji on public.echo_reactions(echo_id, emoji);

-- RLS
alter table public.echo_reactions enable row level security;

do $$ begin
	if not exists (
		select 1 from pg_policies p where p.schemaname='public' and p.tablename='echo_reactions' and p.policyname='Public read reactions'
	) then
		create policy "Public read reactions" on public.echo_reactions for select using (true);
	end if;
	if not exists (
		select 1 from pg_policies p where p.schemaname='public' and p.tablename='echo_reactions' and p.policyname='Public write reactions'
	) then
		create policy "Public write reactions" on public.echo_reactions for insert with check (true);
		create policy "Public remove reactions" on public.echo_reactions for delete using (true);
	end if;
end $$;

-- Realtime (idempotent)
do $$ begin
	if not exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime'
		and schemaname = 'public'
		and tablename = 'echo_reactions'
	) then
		execute 'alter publication supabase_realtime add table public.echo_reactions';
	end if;
end $$;
```

Fresh install (BIGINT `echoes.id`):

```sql
create table if not exists public.echo_reactions (
	id uuid primary key default gen_random_uuid(),
	echo_id bigint not null references public.echoes(id) on delete cascade,
	emoji text not null check (char_length(emoji) > 0 and char_length(emoji) <= 8),
	device_id text not null,
	created_at timestamptz not null default now(),
	unique (echo_id, emoji, device_id)
);

create index if not exists idx_echo_reactions_echo on public.echo_reactions(echo_id);
create index if not exists idx_echo_reactions_emoji on public.echo_reactions(emoji);
create index if not exists idx_echo_reactions_echo_emoji on public.echo_reactions(echo_id, emoji);

alter table public.echo_reactions enable row level security;
do $$ begin
	if not exists (
		select 1 from pg_policies p where p.schemaname='public' and p.tablename='echo_reactions' and p.policyname='Public read reactions'
	) then
		create policy "Public read reactions" on public.echo_reactions for select using (true);
	end if;
	if not exists (
		select 1 from pg_policies p where p.schemaname='public' and p.tablename='echo_reactions' and p.policyname='Public write reactions'
	) then
		create policy "Public write reactions" on public.echo_reactions for insert with check (true);
		create policy "Public remove reactions" on public.echo_reactions for delete using (true);
	end if;
end $$;

do $$ begin
	if not exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime'
		and schemaname = 'public'
		and tablename = 'echo_reactions'
	) then
		execute 'alter publication supabase_realtime add table public.echo_reactions';
	end if;
end $$;
```

Upgrade an existing table (added earlier without `device_id` or wrong constraint):

```sql
alter table public.echo_reactions add column if not exists device_id text;
update public.echo_reactions set device_id = 'legacy' where device_id is null;
alter table public.echo_reactions alter column device_id set not null;

-- Drop old constraints
alter table public.echo_reactions drop constraint if exists echo_reactions_unique;
alter table public.echo_reactions drop constraint if exists echo_reactions_one_per_device;

-- Clean up duplicates (same echo + emoji + device), keep newest
delete from public.echo_reactions r
using public.echo_reactions newer
where r.echo_id = newer.echo_id 
  and r.emoji = newer.emoji
  and r.device_id = newer.device_id 
  and r.id < newer.id;

-- Add correct unique constraint (allows multiple emojis per device)
alter table public.echo_reactions add constraint echo_reactions_unique unique (echo_id, emoji, device_id);

do $$ begin
	if not exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime'
		and schemaname = 'public'
		and tablename = 'echo_reactions'
	) then
		execute 'alter publication supabase_realtime add table public.echo_reactions';
	end if;
end $$;
```

Verification

```sql
select echo_id, emoji, count(*) as cnt from public.echo_reactions group by echo_id, emoji order by echo_id, cnt desc;
```