-- Sword x Staff: catalog dùng chung + trạng thái từng nhân vật.

create table if not exists public.catalog_assets (
  key text primary key,
  category text not null check (category in ('skill', 'gear', 'pet', 'item', 'ui')),
  label text not null,
  default_path text not null,
  storage_path text
);

create table if not exists public.catalog_skills (
  id text primary key,
  tier_class text not null,
  skill_type text not null check (skill_type in ('active', 'passive')),
  vn text not null,
  en text not null,
  cn text not null,
  cd text not null,
  element text not null,
  tier text not null,
  description text not null,
  icon_key text not null references public.catalog_assets (key)
);

create table if not exists public.companion_defs (
  id text primary key,
  name text not null,
  gift_type text not null,
  stats text not null,
  sort_order int not null
);

create table if not exists public.app_owner (
  id int primary key check (id = 1),
  owner_user_id uuid not null references auth.users (id)
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  server_day int not null default 1,
  level int not null default 1,
  combat_power text not null default '0',
  current_class text not null,
  rank_tier text not null default '',
  total_job_level int not null default 1,
  warrior_job_level int not null default 1,
  mage_job_level int not null default 0,
  duelist_job_level int not null default 0,
  current_map text not null default '',
  mirage_tower text not null default '',
  daily_dungeon_status text not null default '',
  spending_tier text not null default '',
  gold text not null default '0',
  morning_star text not null default '0',
  colored_diamond text not null default '0',
  stamina text not null default '0',
  battle_essence text not null default '0',
  normal_prayer_tickets int not null default 0,
  class_prayer_tickets int not null default 0,
  skill_select_tickets int not null default 0,
  prayer_progress text not null default '',
  secret_realm_total int not null default 0,
  hammer_stone int not null default 0,
  pickaxe_gold int not null default 0,
  glove_essence int not null default 0,
  shovel_sand int not null default 0,
  daily_buy_pattern text not null default '',
  fate_fruits int not null default 0,
  time_crystals int not null default 0,
  selected_pet text not null default '',
  pet_status text not null default '',
  relic_progress text not null default '',
  cart_stone_lv int not null default 1,
  cart_ore_lv int not null default 1,
  cart_wood_lv int not null default 1,
  cart_sand_lv int not null default 1,
  cart_other_lv int not null default 1,
  bed_lv int not null default 1,
  goddess_statues text not null default '',
  shop_routine text not null default '',
  custom_question text not null default '',
  last_opened_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists characters_user_opened_idx
  on public.characters (user_id, last_opened_at desc);

create table if not exists public.character_equipment (
  character_id uuid not null references public.characters (id) on delete cascade,
  slot_key text not null check (slot_key in ('weapon', 'subWeapon', 'helmet', 'armor', 'boots')),
  name text not null,
  icon_key text not null references public.catalog_assets (key),
  level int not null,
  quality text not null,
  notes text not null default '',
  primary key (character_id, slot_key)
);

create table if not exists public.character_skill_slots (
  character_id uuid not null references public.characters (id) on delete cascade,
  slot_index int not null check (slot_index between 1 and 8),
  slot_kind text not null,
  level int not null,
  primary key (character_id, slot_index)
);

create table if not exists public.character_skills (
  character_id uuid not null references public.characters (id) on delete cascade,
  skill_id text not null,
  owned boolean not null default false,
  quality text not null,
  stars int not null default 1,
  equipped_slot int not null default 0 check (equipped_slot between 0 and 4),
  primary key (character_id, skill_id)
);

create table if not exists public.character_custom_skills (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters (id) on delete cascade,
  vn text not null,
  en text not null default '',
  cn text not null default '自定义',
  tier_class text not null,
  skill_type text not null check (skill_type in ('active', 'passive')),
  element text not null default 'Vật Lý',
  cd text not null default '',
  tier text not null default 'A',
  description text not null default '',
  icon_key text not null default 'duelist_hero' references public.catalog_assets (key),
  owned boolean not null default true,
  quality text not null default 'Cam (Truyền Thuyết)',
  stars int not null default 1,
  equipped_slot int not null default 0 check (equipped_slot between 0 and 4)
);

create table if not exists public.character_companions (
  character_id uuid not null references public.characters (id) on delete cascade,
  companion_id text not null references public.companion_defs (id),
  level int not null,
  priority text not null default '',
  primary key (character_id, companion_id)
);

alter table public.catalog_assets enable row level security;
alter table public.catalog_skills enable row level security;
alter table public.companion_defs enable row level security;
alter table public.app_owner enable row level security;
alter table public.characters enable row level security;
alter table public.character_equipment enable row level security;
alter table public.character_skill_slots enable row level security;
alter table public.character_skills enable row level security;
alter table public.character_custom_skills enable row level security;
alter table public.character_companions enable row level security;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_owner where owner_user_id = auth.uid()
  );
$$;

create or replace function public.owner_exists()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_owner);
$$;

create or replace function public.claim_owner()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.app_owner (id, owner_user_id)
  values (1, auth.uid())
  on conflict (id) do nothing;
end;
$$;

create or replace function public._insert_character_children(p_id uuid, payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(coalesce(payload->'equipment', '[]'::jsonb)) loop
    insert into public.character_equipment (character_id, slot_key, name, icon_key, level, quality, notes)
    values (
      p_id,
      item->>'slot_key',
      coalesce(item->>'name', ''),
      coalesce(item->>'icon_key', 'eq_weapon'),
      coalesce((item->>'level')::int, 0),
      coalesce(item->>'quality', ''),
      coalesce(item->>'notes', '')
    );
  end loop;

  for item in select * from jsonb_array_elements(coalesce(payload->'skill_slots', '[]'::jsonb)) loop
    insert into public.character_skill_slots (character_id, slot_index, slot_kind, level)
    values (
      p_id,
      (item->>'slot_index')::int,
      item->>'slot_kind',
      coalesce((item->>'level')::int, 1)
    );
  end loop;

  for item in select * from jsonb_array_elements(coalesce(payload->'skills', '[]'::jsonb)) loop
    insert into public.character_skills (character_id, skill_id, owned, quality, stars, equipped_slot)
    values (
      p_id,
      item->>'skill_id',
      coalesce((item->>'owned')::boolean, false),
      coalesce(item->>'quality', 'Tím (Sử Thi)'),
      coalesce((item->>'stars')::int, 1),
      coalesce((item->>'equipped_slot')::int, 0)
    );
  end loop;

  for item in select * from jsonb_array_elements(coalesce(payload->'companions', '[]'::jsonb)) loop
    insert into public.character_companions (character_id, companion_id, level, priority)
    values (
      p_id,
      item->>'companion_id',
      coalesce((item->>'level')::int, 1),
      coalesce(item->>'priority', '')
    );
  end loop;

  for item in select * from jsonb_array_elements(coalesce(payload->'custom_skills', '[]'::jsonb)) loop
    insert into public.character_custom_skills (
      character_id, vn, en, cn, tier_class, skill_type, element, cd, tier, description,
      icon_key, owned, quality, stars, equipped_slot
    ) values (
      p_id,
      item->>'vn',
      coalesce(item->>'en', ''),
      coalesce(item->>'cn', '自定义'),
      coalesce(item->>'tier_class', 'R2'),
      coalesce(item->>'skill_type', 'active'),
      coalesce(item->>'element', 'Vật Lý'),
      coalesce(item->>'cd', ''),
      coalesce(item->>'tier', 'A'),
      coalesce(item->>'description', ''),
      coalesce(item->>'icon_key', 'duelist_hero'),
      coalesce((item->>'owned')::boolean, true),
      coalesce(item->>'quality', 'Cam (Truyền Thuyết)'),
      coalesce((item->>'stars')::int, 1),
      coalesce((item->>'equipped_slot')::int, 0)
    );
  end loop;
end;
$$;

create or replace function public.create_character(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_id uuid := gen_random_uuid();
  c jsonb := payload->'character';
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if c is null or coalesce(c->>'name', '') = '' then
    raise exception 'missing character name';
  end if;

  insert into public.characters (
    id, user_id, name, server_day, level, combat_power, current_class, rank_tier,
    total_job_level, warrior_job_level, mage_job_level, duelist_job_level,
    current_map, mirage_tower, daily_dungeon_status, spending_tier,
    gold, morning_star, colored_diamond, stamina, battle_essence,
    normal_prayer_tickets, class_prayer_tickets, skill_select_tickets, prayer_progress,
    secret_realm_total, hammer_stone, pickaxe_gold, glove_essence, shovel_sand, daily_buy_pattern,
    fate_fruits, time_crystals, selected_pet, pet_status, relic_progress,
    cart_stone_lv, cart_ore_lv, cart_wood_lv, cart_sand_lv, cart_other_lv, bed_lv,
    goddess_statues, shop_routine, custom_question
  ) values (
    new_id, uid,
    c->>'name',
    coalesce((c->>'server_day')::int, 1),
    coalesce((c->>'level')::int, 1),
    coalesce(c->>'combat_power', '0'),
    coalesce(c->>'current_class', 'Chiến Binh R1 (Warrior)'),
    coalesce(c->>'rank_tier', ''),
    coalesce((c->>'total_job_level')::int, 1),
    coalesce((c->>'warrior_job_level')::int, 1),
    coalesce((c->>'mage_job_level')::int, 0),
    coalesce((c->>'duelist_job_level')::int, 0),
    coalesce(c->>'current_map', ''),
    coalesce(c->>'mirage_tower', ''),
    coalesce(c->>'daily_dungeon_status', ''),
    coalesce(c->>'spending_tier', ''),
    coalesce(c->>'gold', '0'),
    coalesce(c->>'morning_star', '0'),
    coalesce(c->>'colored_diamond', '0'),
    coalesce(c->>'stamina', '0'),
    coalesce(c->>'battle_essence', '0'),
    coalesce((c->>'normal_prayer_tickets')::int, 0),
    coalesce((c->>'class_prayer_tickets')::int, 0),
    coalesce((c->>'skill_select_tickets')::int, 0),
    coalesce(c->>'prayer_progress', ''),
    coalesce((c->>'secret_realm_total')::int, 0),
    coalesce((c->>'hammer_stone')::int, 0),
    coalesce((c->>'pickaxe_gold')::int, 0),
    coalesce((c->>'glove_essence')::int, 0),
    coalesce((c->>'shovel_sand')::int, 0),
    coalesce(c->>'daily_buy_pattern', ''),
    coalesce((c->>'fate_fruits')::int, 0),
    coalesce((c->>'time_crystals')::int, 0),
    coalesce(c->>'selected_pet', ''),
    coalesce(c->>'pet_status', ''),
    coalesce(c->>'relic_progress', ''),
    coalesce((c->>'cart_stone_lv')::int, 1),
    coalesce((c->>'cart_ore_lv')::int, 1),
    coalesce((c->>'cart_wood_lv')::int, 1),
    coalesce((c->>'cart_sand_lv')::int, 1),
    coalesce((c->>'cart_other_lv')::int, 1),
    coalesce((c->>'bed_lv')::int, 1),
    coalesce(c->>'goddess_statues', ''),
    coalesce(c->>'shop_routine', ''),
    coalesce(c->>'custom_question', '')
  );

  perform public._insert_character_children(new_id, payload);
  return new_id;
end;
$$;

create or replace function public.duplicate_character(p_source uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  new_id uuid := gen_random_uuid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if not exists (select 1 from public.characters where id = p_source and user_id = uid) then
    raise exception 'not found';
  end if;

  insert into public.characters (
    id, user_id, name, server_day, level, combat_power, current_class, rank_tier,
    total_job_level, warrior_job_level, mage_job_level, duelist_job_level,
    current_map, mirage_tower, daily_dungeon_status, spending_tier,
    gold, morning_star, colored_diamond, stamina, battle_essence,
    normal_prayer_tickets, class_prayer_tickets, skill_select_tickets, prayer_progress,
    secret_realm_total, hammer_stone, pickaxe_gold, glove_essence, shovel_sand, daily_buy_pattern,
    fate_fruits, time_crystals, selected_pet, pet_status, relic_progress,
    cart_stone_lv, cart_ore_lv, cart_wood_lv, cart_sand_lv, cart_other_lv, bed_lv,
    goddess_statues, shop_routine, custom_question
  )
  select
    new_id, uid, p_name, server_day, level, combat_power, current_class, rank_tier,
    total_job_level, warrior_job_level, mage_job_level, duelist_job_level,
    current_map, mirage_tower, daily_dungeon_status, spending_tier,
    gold, morning_star, colored_diamond, stamina, battle_essence,
    normal_prayer_tickets, class_prayer_tickets, skill_select_tickets, prayer_progress,
    secret_realm_total, hammer_stone, pickaxe_gold, glove_essence, shovel_sand, daily_buy_pattern,
    fate_fruits, time_crystals, selected_pet, pet_status, relic_progress,
    cart_stone_lv, cart_ore_lv, cart_wood_lv, cart_sand_lv, cart_other_lv, bed_lv,
    goddess_statues, shop_routine, custom_question
  from public.characters where id = p_source;

  insert into public.character_equipment (character_id, slot_key, name, icon_key, level, quality, notes)
  select new_id, slot_key, name, icon_key, level, quality, notes
  from public.character_equipment where character_id = p_source;

  insert into public.character_skill_slots (character_id, slot_index, slot_kind, level)
  select new_id, slot_index, slot_kind, level
  from public.character_skill_slots where character_id = p_source;

  insert into public.character_skills (character_id, skill_id, owned, quality, stars, equipped_slot)
  select new_id, skill_id, owned, quality, stars, equipped_slot
  from public.character_skills where character_id = p_source;

  insert into public.character_custom_skills (
    character_id, vn, en, cn, tier_class, skill_type, element, cd, tier, description,
    icon_key, owned, quality, stars, equipped_slot
  )
  select
    new_id, vn, en, cn, tier_class, skill_type, element, cd, tier, description,
    icon_key, owned, quality, stars, equipped_slot
  from public.character_custom_skills where character_id = p_source;

  insert into public.character_companions (character_id, companion_id, level, priority)
  select new_id, companion_id, level, priority
  from public.character_companions where character_id = p_source;

  return new_id;
end;
$$;

create or replace function public.replace_character(p_id uuid, payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  c jsonb := payload->'character';
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if not exists (select 1 from public.characters where id = p_id and user_id = uid) then
    raise exception 'not found';
  end if;

  update public.characters set
    name = coalesce(c->>'name', name),
    server_day = coalesce((c->>'server_day')::int, server_day),
    level = coalesce((c->>'level')::int, level),
    combat_power = coalesce(c->>'combat_power', combat_power),
    current_class = coalesce(c->>'current_class', current_class),
    rank_tier = coalesce(c->>'rank_tier', rank_tier),
    total_job_level = coalesce((c->>'total_job_level')::int, total_job_level),
    warrior_job_level = coalesce((c->>'warrior_job_level')::int, warrior_job_level),
    mage_job_level = coalesce((c->>'mage_job_level')::int, mage_job_level),
    duelist_job_level = coalesce((c->>'duelist_job_level')::int, duelist_job_level),
    current_map = coalesce(c->>'current_map', current_map),
    mirage_tower = coalesce(c->>'mirage_tower', mirage_tower),
    daily_dungeon_status = coalesce(c->>'daily_dungeon_status', daily_dungeon_status),
    spending_tier = coalesce(c->>'spending_tier', spending_tier),
    gold = coalesce(c->>'gold', gold),
    morning_star = coalesce(c->>'morning_star', morning_star),
    colored_diamond = coalesce(c->>'colored_diamond', colored_diamond),
    stamina = coalesce(c->>'stamina', stamina),
    battle_essence = coalesce(c->>'battle_essence', battle_essence),
    normal_prayer_tickets = coalesce((c->>'normal_prayer_tickets')::int, normal_prayer_tickets),
    class_prayer_tickets = coalesce((c->>'class_prayer_tickets')::int, class_prayer_tickets),
    skill_select_tickets = coalesce((c->>'skill_select_tickets')::int, skill_select_tickets),
    prayer_progress = coalesce(c->>'prayer_progress', prayer_progress),
    secret_realm_total = coalesce((c->>'secret_realm_total')::int, secret_realm_total),
    hammer_stone = coalesce((c->>'hammer_stone')::int, hammer_stone),
    pickaxe_gold = coalesce((c->>'pickaxe_gold')::int, pickaxe_gold),
    glove_essence = coalesce((c->>'glove_essence')::int, glove_essence),
    shovel_sand = coalesce((c->>'shovel_sand')::int, shovel_sand),
    daily_buy_pattern = coalesce(c->>'daily_buy_pattern', daily_buy_pattern),
    fate_fruits = coalesce((c->>'fate_fruits')::int, fate_fruits),
    time_crystals = coalesce((c->>'time_crystals')::int, time_crystals),
    selected_pet = coalesce(c->>'selected_pet', selected_pet),
    pet_status = coalesce(c->>'pet_status', pet_status),
    relic_progress = coalesce(c->>'relic_progress', relic_progress),
    cart_stone_lv = coalesce((c->>'cart_stone_lv')::int, cart_stone_lv),
    cart_ore_lv = coalesce((c->>'cart_ore_lv')::int, cart_ore_lv),
    cart_wood_lv = coalesce((c->>'cart_wood_lv')::int, cart_wood_lv),
    cart_sand_lv = coalesce((c->>'cart_sand_lv')::int, cart_sand_lv),
    cart_other_lv = coalesce((c->>'cart_other_lv')::int, cart_other_lv),
    bed_lv = coalesce((c->>'bed_lv')::int, bed_lv),
    goddess_statues = coalesce(c->>'goddess_statues', goddess_statues),
    shop_routine = coalesce(c->>'shop_routine', shop_routine),
    custom_question = coalesce(c->>'custom_question', custom_question)
  where id = p_id;

  delete from public.character_equipment where character_id = p_id;
  delete from public.character_skill_slots where character_id = p_id;
  delete from public.character_skills where character_id = p_id;
  delete from public.character_custom_skills where character_id = p_id;
  delete from public.character_companions where character_id = p_id;
  perform public._insert_character_children(p_id, payload);
end;
$$;

revoke all on function public.is_owner() from public;
revoke all on function public.owner_exists() from public;
revoke all on function public.claim_owner() from public;
revoke all on function public._insert_character_children(uuid, jsonb) from public;
revoke all on function public.create_character(jsonb) from public;
revoke all on function public.duplicate_character(uuid, text) from public;
revoke all on function public.replace_character(uuid, jsonb) from public;

grant execute on function public.is_owner() to authenticated;
grant execute on function public.owner_exists() to anon, authenticated;
grant execute on function public.claim_owner() to authenticated;
grant execute on function public.create_character(jsonb) to authenticated;
grant execute on function public.duplicate_character(uuid, text) to authenticated;
grant execute on function public.replace_character(uuid, jsonb) to authenticated;

grant select on public.catalog_assets, public.catalog_skills, public.companion_defs to authenticated;
grant update on public.catalog_assets to authenticated;
grant select, insert, update, delete on public.characters to authenticated;
grant select, insert, update, delete on public.character_equipment to authenticated;
grant select, insert, update, delete on public.character_skill_slots to authenticated;
grant select, insert, update, delete on public.character_skills to authenticated;
grant select, insert, update, delete on public.character_custom_skills to authenticated;
grant select, insert, update, delete on public.character_companions to authenticated;
grant select on public.app_owner to authenticated;

drop policy if exists catalog_assets_read on public.catalog_assets;
drop policy if exists catalog_assets_write on public.catalog_assets;
create policy catalog_assets_read on public.catalog_assets
  for select to authenticated using (true);
create policy catalog_assets_write on public.catalog_assets
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists catalog_skills_read on public.catalog_skills;
create policy catalog_skills_read on public.catalog_skills
  for select to authenticated using (true);

drop policy if exists companion_defs_read on public.companion_defs;
create policy companion_defs_read on public.companion_defs
  for select to authenticated using (true);

drop policy if exists app_owner_read on public.app_owner;
create policy app_owner_read on public.app_owner
  for select to authenticated using (owner_user_id = auth.uid());

drop policy if exists characters_own on public.characters;
create policy characters_own on public.characters
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists character_equipment_own on public.character_equipment;
create policy character_equipment_own on public.character_equipment
  for all to authenticated
  using (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ));

drop policy if exists character_skill_slots_own on public.character_skill_slots;
create policy character_skill_slots_own on public.character_skill_slots
  for all to authenticated
  using (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ));

drop policy if exists character_skills_own on public.character_skills;
create policy character_skills_own on public.character_skills
  for all to authenticated
  using (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ));

drop policy if exists character_custom_skills_own on public.character_custom_skills;
create policy character_custom_skills_own on public.character_custom_skills
  for all to authenticated
  using (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ));

drop policy if exists character_companions_own on public.character_companions;
create policy character_companions_own on public.character_companions
  for all to authenticated
  using (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid()
  ));

insert into storage.buckets (id, name, public)
values ('game-assets', 'game-assets', true)
on conflict (id) do update set public = true;

drop policy if exists game_assets_read on storage.objects;
drop policy if exists game_assets_insert on storage.objects;
drop policy if exists game_assets_update on storage.objects;
drop policy if exists game_assets_delete on storage.objects;

create policy game_assets_read on storage.objects
  for select to public using (bucket_id = 'game-assets');
create policy game_assets_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'game-assets' and public.is_owner());
create policy game_assets_update on storage.objects
  for update to authenticated
  using (bucket_id = 'game-assets' and public.is_owner())
  with check (bucket_id = 'game-assets' and public.is_owner());
create policy game_assets_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'game-assets' and public.is_owner());

notify pgrst, 'reload schema';
