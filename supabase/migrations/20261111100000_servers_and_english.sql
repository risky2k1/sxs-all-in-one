-- Servers own an open date. Character day is derived in the app, not typed in.

create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  opened_on date not null,
  created_at timestamptz not null default now()
);

alter table public.characters
  add column if not exists server_id uuid references public.servers (id);

do $$
declare
  owner uuid;
  new_server uuid;
begin
  for owner in
    select distinct user_id from public.characters where server_id is null
  loop
    insert into public.servers (user_id, name, opened_on)
    values (
      owner,
      'Default',
      (timezone('Asia/Ho_Chi_Minh', now()))::date - 3
    )
    returning id into new_server;
    update public.characters
      set server_id = new_server
      where user_id = owner and server_id is null;
  end loop;
end $$;

alter table public.servers enable row level security;
drop policy if exists servers_own on public.servers;
create policy servers_own on public.servers
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
grant select, insert, update, delete on public.servers to authenticated;

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
  sid uuid := nullif(c->>'server_id', '')::uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if c is null or coalesce(c->>'name', '') = '' then
    raise exception 'missing character name';
  end if;
  if sid is null or not exists (
    select 1 from public.servers where id = sid and user_id = uid
  ) then
    raise exception 'invalid server';
  end if;

  insert into public.characters (
    id, user_id, server_id, name, server_day, level, combat_power, current_class, rank_tier,
    total_job_level, warrior_job_level, mage_job_level, duelist_job_level,
    current_map, mirage_tower, daily_dungeon_status, spending_tier,
    gold, morning_star, colored_diamond, stamina, battle_essence,
    normal_prayer_tickets, class_prayer_tickets, skill_select_tickets, prayer_progress,
    secret_realm_total, hammer_stone, pickaxe_gold, glove_essence, shovel_sand, daily_buy_pattern,
    fate_fruits, time_crystals, selected_pet, pet_status, relic_progress,
    cart_stone_lv, cart_ore_lv, cart_wood_lv, cart_sand_lv, cart_other_lv, bed_lv,
    goddess_statues, shop_routine, custom_question
  ) values (
    new_id, uid, sid,
    c->>'name',
    1,
    coalesce((c->>'level')::int, 1),
    coalesce(c->>'combat_power', '0'),
    coalesce(c->>'current_class', 'Warrior'),
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
    id, user_id, server_id, name, server_day, level, combat_power, current_class, rank_tier,
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
    new_id, uid, server_id, p_name, server_day, level, combat_power, current_class, rank_tier,
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

update public.catalog_skills set element = 'Physical' where element = 'Vật Lý';
update public.catalog_skills set element = 'Wind' where element = 'Phong';
update public.catalog_skills set element = 'Light' where element = 'Quang';
update public.catalog_skills set element = 'Fire' where element = 'Hỏa';
update public.catalog_skills set element = 'Dark' where element = 'Ám';

update public.companion_defs set name = 'Qin', gift_type = 'Daily goods' where id = 'qin';
update public.companion_defs set name = 'Akane', gift_type = 'Flowers' where id = 'akane';
update public.companion_defs set gift_type = 'Gems' where id = 'hermes';
update public.companion_defs set gift_type = 'Books' where id = 'killian';
update public.companion_defs set name = 'Village Chief', gift_type = 'Daily goods' where id = 'village_chief';

update public.characters set current_class = 'Warrior R1' where current_class = 'Chiến Binh R1 (Warrior)';
update public.characters set current_class = 'Duelist R2' where current_class = 'Đấu Sĩ R2 (Duelist)';
update public.characters set current_class = 'Berserker R3' where current_class = 'Cuồng Chiến Sĩ R3 (Berserker)';
update public.characters set current_class = 'Conqueror R4' where current_class = 'Chinh Phục Giả R4 (Conqueror)';
update public.characters set current_class = 'Knight' where current_class = 'Kỵ Sĩ R2/R3 (Knight)';
update public.characters set current_map = 'Cinder Ridge' where current_map = 'Sơn Quốc 5 (Map Núi)';
update public.characters set rank_tier = 'Rookie III / Hero I' where rank_tier = 'Tân Binh III / Anh Hùng I';
update public.characters set mirage_tower = 'Moonlit Forest F85' where mirage_tower = 'Rừng Ánh Trăng - Tầng 85';
update public.characters set spending_tier = 'Light spend / monthly card' where spending_tier like 'Ít nạp%';
update public.characters set spending_tier = 'F2P' where spending_tier like 'Cày chay%';
update public.characters set daily_dungeon_status = 'Used 2/2 free runs' where daily_dungeon_status like 'Đã đi 2/2%';
update public.characters set prayer_progress = '200/200 (chest I opened for Blade of Lament)' where prayer_progress like '200/200%';
update public.characters set daily_buy_pattern = 'Buy 2-2-2-2 each day (gold mine only)' where daily_buy_pattern like 'Đang mua chuẩn%';
update public.characters set selected_pet = 'Locked until Lv.50 (Aegiswing / Nyxarchon)' where selected_pet like 'Chưa mở%';
update public.characters set pet_status = 'Saving bond strings and crystals (60 crystals for a miracle pet)' where pet_status like 'Đang tích%';
update public.characters set relic_progress = 'Farming blue relics before Cinder Ridge; element cards favor Dark and Fire' where relic_progress like 'Đang gom%';
update public.characters set goddess_statues = 'Opened every current area before the free bed speedup' where goddess_statues like 'Đã mở 100%%';
update public.characters set shop_routine = 'General shop rolls 2-3 times for discounted stone and wood' where shop_routine like 'Shop Đồ Chung%';
update public.characters set custom_question = 'I just became a Duelist (Lv.44). With this account, suggest the best 4 Active and 4 Charm skills for maps, the tower, and bosses, how to spend Morning Stars until Lv.82, and what to watch for on Cinder Ridge.' where custom_question like 'Mình vừa lên%';

update public.character_equipment set quality = 'Rare' where quality = 'Lam (Hiếm)';
update public.character_equipment set quality = 'Epic' where quality = 'Tím (Sử Thi)';
update public.character_equipment set quality = 'Legendary' where quality = 'Cam (Truyền Thuyết)';
update public.character_equipment set quality = 'Mythic' where quality = 'Vàng (Kỳ Tích)';
update public.character_equipment set quality = 'Divine' where quality = 'Đỏ (Thần Thoại)';
update public.character_equipment set name = 'Main Weapon' where slot_key = 'weapon' and name like 'Vũ Khí Chính%';
update public.character_equipment set name = 'Sub Weapon' where slot_key = 'subWeapon' and name like 'Vũ Khí Phụ%';
update public.character_equipment set name = 'Helmet' where slot_key = 'helmet' and name = 'Mũ Giáp';
update public.character_equipment set name = 'Armor' where slot_key = 'armor' and name = 'Áo Giáp';
update public.character_equipment set name = 'Boots' where slot_key = 'boots' and name = 'Giày Chiến';
update public.character_equipment set notes = 'Priority 1' where notes = 'Ưu tiên số 1';
update public.character_equipment set notes = 'Caught up to the resonance tier' where notes = 'Vừa kéo lên kịp mốc Cộng Hưởng';
update public.character_equipment set notes = 'Balanced at +35' where notes = 'Đã cân bằng mốc +35';

update public.character_skills set quality = 'Rare' where quality = 'Lam (Hiếm)';
update public.character_skills set quality = 'Epic' where quality = 'Tím (Sử Thi)';
update public.character_skills set quality = 'Legendary' where quality = 'Cam (Truyền Thuyết)';
update public.character_skills set quality = 'Mythic' where quality = 'Vàng (Kỳ Tích)';
update public.character_skills set quality = 'Divine' where quality = 'Đỏ (Thần Thoại)';

update public.character_companions set priority = 'Priority 1 (push 35, then 50, then 70)' where priority like 'Ưu tiên #1%';
update public.character_companions set priority = 'Priority 2 (push 35, then 60 for pet tickets)' where priority like 'Ưu tiên #2%';
update public.character_companions set priority = 'Priority 3 (push 35, then 60)' where priority like 'Ưu tiên #3%';
update public.character_companions set priority = 'Hold (stop at 35 after the 14-day quest)' where priority like 'Cầm chừng%';
update public.character_companions set priority = 'Stop at Lv.20 (give gifts to Qin)' where priority like 'DỪNG Ở LV.20%';

alter table public.characters alter column server_id set not null;

notify pgrst, 'reload schema';
