alter table public.catalog_assets drop constraint if exists catalog_assets_category_check;
alter table public.catalog_assets
  add constraint catalog_assets_category_check
  check (category in ('skill', 'gear', 'pet', 'item', 'ui', 'companion'));

insert into public.catalog_assets (key, category, label, default_path)
values
  ('companion_qin', 'companion', 'Qin', '/assets/player_avatar.png'),
  ('companion_akane', 'companion', 'Akane', '/assets/player_avatar.png'),
  ('companion_hermes', 'companion', 'Hermes', '/assets/player_avatar.png'),
  ('companion_killian', 'companion', 'Killian', '/assets/player_avatar.png'),
  ('companion_village_chief', 'companion', 'Village Chief', '/assets/player_avatar.png')
on conflict (key) do nothing;

alter table public.companion_defs
  add column if not exists icon_key text references public.catalog_assets (key);

update public.companion_defs
set icon_key = 'companion_' || id
where icon_key is null;

create table if not exists public.catalog_fantomons (
  id text primary key,
  name text not null,
  role text not null,
  icon_key text not null references public.catalog_assets (key)
);

create table if not exists public.character_fantomons (
  character_id uuid not null references public.characters (id) on delete cascade,
  fantomon_id text not null references public.catalog_fantomons (id),
  owned boolean not null default false,
  quality text not null default 'Epic',
  stars int not null default 1,
  equipped_slot int not null default 0 check (equipped_slot between 0 and 4),
  primary key (character_id, fantomon_id)
);

alter table public.catalog_fantomons enable row level security;
alter table public.character_fantomons enable row level security;

drop policy if exists catalog_fantomons_read on public.catalog_fantomons;
create policy catalog_fantomons_read on public.catalog_fantomons
  for select to authenticated using (true);

drop policy if exists character_fantomons_own on public.character_fantomons;
create policy character_fantomons_own on public.character_fantomons
  for all to authenticated
  using (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ));

grant select on public.catalog_fantomons to authenticated;
grant select, insert, update, delete on public.character_fantomons to authenticated;

insert into public.catalog_fantomons (id, name, role, icon_key)
values
  ('pet_aegiswing', 'Aegiswing', 'Shield, crit, and accuracy. Strong for mapping.', 'pet_aegiswing'),
  ('pet_nyxarchon', 'Nyxarchon', 'True damage and armor break. Strong for early bosses.', 'pet_nyxarchon'),
  ('pet_pandarial', 'Pandarial', 'Cuts one turn of cooldowns at the start and heals.', 'pet_pandarial')
on conflict (id) do update
set name = excluded.name, role = excluded.role, icon_key = excluded.icon_key;

notify pgrst, 'reload schema';
