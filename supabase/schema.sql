create table public.teams (
  id     bigserial primary key,
  name   text   not null,
  league text   not null check (league in ('J1', 'J2', 'J3')),
  colors text[] not null
);

create table public.players (
  id      bigserial primary key,
  team_id bigint not null references public.teams(id) on delete cascade,
  num     integer not null,
  name    text    not null,
  furi    text    not null,
  pos     text    not null check (pos in ('GK', 'DF', 'MF', 'FW'))
);

create table public.notices (
  id   bigserial primary key,
  date text not null,
  text text not null
);

-- ===========================
-- Row Level Security
-- ===========================

alter table public.teams   enable row level security;
alter table public.players enable row level security;
alter table public.notices enable row level security;

-- 読み取りは誰でも可（クイズ表示に必要）
create policy "teams: public read"   on public.teams   for select using (true);
create policy "players: public read" on public.players for select using (true);
create policy "notices: public read" on public.notices for select using (true);

-- 書き込みは service_role のみ（anon / authenticated は不可）
create policy "teams: service only insert" on public.teams   for insert with check (false);
create policy "teams: service only update" on public.teams   for update using (false);
create policy "teams: service only delete" on public.teams   for delete using (false);

create policy "players: service only insert" on public.players for insert with check (false);
create policy "players: service only update" on public.players for update using (false);
create policy "players: service only delete" on public.players for delete using (false);

create policy "notices: service only insert" on public.notices for insert with check (false);
create policy "notices: service only delete" on public.notices for delete using (false);
