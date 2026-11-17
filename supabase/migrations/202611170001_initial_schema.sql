-- Surpresa de 6 meses com Yasmin
-- Execute no SQL Editor do Supabase ou via `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  label text not null default 'Yasmin',
  token_hash text not null unique,
  token_value text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.decrees (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  texto varchar(500) not null check (char_length(trim(texto)) between 1 and 500),
  status text not null default 'recebido' check (status in ('recebido', 'em_andamento', 'cumprido')),
  resposta_do_namorado varchar(300) check (resposta_do_namorado is null or char_length(resposta_do_namorado) <= 300),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_runs (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  client_run_id uuid not null unique,
  score integer not null check (score between 0 and 1000000),
  duration_seconds integer not null check (duration_seconds between 1 and 180),
  chocolate_cakes integer not null default 0 check (chocolate_cakes between 0 and 500),
  macchi_collars integer not null default 0 check (macchi_collars between 0 and 500),
  bags integer not null default 0 check (bags between 0 and 500),
  zara_clothes integer not null default 0 check (zara_clothes between 0 and 500),
  won boolean not null,
  attempts integer not null default 1 check (attempts between 1 and 10000),
  created_at timestamptz not null default now()
);

create table if not exists public.album_events (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  photo_id smallint not null check (photo_id between 1 and 7),
  event_type text not null check (event_type in ('opened', 'liked')),
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  event_type text not null check (event_type in ('visit', 'decree_created', 'game_finished')),
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limit_events (
  id bigint generated always as identity primary key,
  invite_id uuid not null references public.invites(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists decrees_invite_created_idx on public.decrees (invite_id, created_at desc);
create index if not exists decrees_status_idx on public.decrees (status, created_at desc);
create index if not exists game_runs_invite_score_idx on public.game_runs (invite_id, score desc);
create index if not exists game_runs_created_idx on public.game_runs (created_at desc);
create index if not exists album_events_invite_created_idx on public.album_events (invite_id, created_at desc);
create index if not exists album_events_photo_idx on public.album_events (invite_id, photo_id, event_type);
create index if not exists activity_events_invite_created_idx on public.activity_events (invite_id, created_at desc);
create index if not exists rate_limit_lookup_idx on public.rate_limit_events (invite_id, action, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists decrees_set_updated_at on public.decrees;
create trigger decrees_set_updated_at
before update on public.decrees
for each row execute function public.set_updated_at();

-- Todas as tabelas permanecem fechadas para anon/authenticated. O aplicativo acessa
-- dados privados exclusivamente em rotas server-side com a service role.
alter table public.invites enable row level security;
alter table public.admin_users enable row level security;
alter table public.decrees enable row level security;
alter table public.game_runs enable row level security;
alter table public.album_events enable row level security;
alter table public.activity_events enable row level security;
alter table public.rate_limit_events enable row level security;

revoke all on table public.invites from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.decrees from anon, authenticated;
revoke all on table public.game_runs from anon, authenticated;
revoke all on table public.album_events from anon, authenticated;
revoke all on table public.activity_events from anon, authenticated;
revoke all on table public.rate_limit_events from anon, authenticated;

-- Limpeza opcional para ser agendada pelo Supabase Cron se desejado:
-- delete from public.rate_limit_events where created_at < now() - interval '24 hours';
