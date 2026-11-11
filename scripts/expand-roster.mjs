import fs from "node:fs";

const gifts = {
  Flower: "Flowers",
  Book: "Books",
  Valuables: "Precious gifts",
  Commodity: "Practical gifts",
};

const existing = new Set(["qin", "akane", "hermes", "killian", "village_chief"]);

const companions = [
  ["Luther", "Sorcerer", "Flower"],
  ["Mateo", "Sorcerer", "Book"],
  ["Mio", "Sorcerer", "Book"],
  ["Sylvia", "Sorcerer", "Valuables"],
  ["Carol", "Sorcerer", "Book"],
  ["Jiangwang", "Sorcerer", "Commodity"],
  ["Megumin", "Sorcerer", "Book"],
  ["Naza", "Sorcerer", "Commodity"],
  ["Ophelia", "Sorcerer", "Book"],
  ["Thirteen", "Sorcerer", "Book"],
  ["Wuxian", "Sorcerer", "Book"],
  ["Yan He", "Sorcerer", "Book"],
  ["Zeus", "Sorcerer", "Valuables"],
  ["Freya", "Duelist", "Commodity"],
  ["Ming", "Duelist", "Flower"],
  ["Naira", "Duelist", "Flower"],
  ["Reina", "Duelist", "Flower"],
  ["Derrick", "Duelist", "Valuables"],
  ["Eiichi", "Duelist", "Valuables"],
  ["Karlos", "Duelist", "Commodity"],
  ["Kazuma", "Duelist", "Commodity"],
  ["Luo Xiao-Hei", "Duelist", "Flower"],
  ["Luye", "Duelist", "Book"],
  ["Mayoi", "Duelist", "Commodity"],
  ["Mynn", "Duelist", "Flower"],
  ["Pera", "Duelist", "Valuables"],
  ["Seven", "Duelist", "Flower"],
  ["Wuji", "Duelist", "Book"],
  ["Yao", "Duelist", "Flower"],
  ["Molly", "Knight", "Valuables"],
  ["Vigard", "Knight", "Book"],
  ["Belric", "Knight", "Book"],
  ["Braulio", "Knight", "Valuables"],
  ["Da Chun", "Knight", "Commodity"],
  ["Darkness", "Knight", "Commodity"],
  ["Gerald", "Knight", "Commodity"],
  ["Hui", "Knight", "Commodity"],
  ["Juubee", "Knight", "Flower"],
  ["Micaela", "Knight", "Valuables"],
  ["Riven", "Knight", "Commodity"],
  ["Alice", "Sage", "Flower"],
  ["Lillie", "Sage", "Valuables"],
  ["Mysterious Merchant", "Sage", "Flower"],
  ["Suimo", "Sage", "Book"],
  ["Suzu", "Sage", "Valuables"],
  ["Aqua", "Sage", "Valuables"],
  ["Astrid", "Sage", "Flower"],
  ["Dai Bo", "Sage", "Book"],
  ["Dora", "Sage", "Valuables"],
  ["Isla", "Sage", "Flower"],
  ["Luo Tianyi", "Sage", "Commodity"],
  ["Rex", "Sage", "Book"],
];

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const fantomons = [
  ["pet_aegiswing", "Aegiswing", "Rainbow · Guardian Angel, then heal and Power Unsealed", "pet_aegiswing"],
  ["pet_nyxarchon", "Nyxarchon", "Rainbow · Dark hit and DEF reduction stacks", "pet_nyxarchon"],
  ["pet_pandarial", "Pandarial", "Rainbow · Cuts 1 turn of Technique CD, then heals", "pet_pandarial"],
  ["pet_armopi", "Armopi", "SSR · DEF stacks that turn into a shield", "player_avatar"],
  ["pet_herbote", "Herbote", "SSR · Heal and cleanse", "player_avatar"],
  ["pet_kels", "Kels", "SSR · Water hit and dispel", "player_avatar"],
  ["pet_sylvaerie", "Sylvaerie", "SSR · ATK and SPD after each turn", "player_avatar"],
  ["pet_terragon", "Terragon", "SSR · Physical hit and ATK down", "player_avatar"],
  ["pet_zeioletus", "Zeioletus", "SSR · Light hit that knocks enemies airborne", "player_avatar"],
  ["pet_boaro", "Boaro", "SR · Shield when HP drops", "player_avatar"],
  ["pet_chomusuke", "Chomusuke", "SR · Extra attack after a Technique", "player_avatar"],
  ["pet_falko", "Falko", "SR · Physical damage around the target", "player_avatar"],
  ["pet_mandragora", "Mandragora", "SR · Heals an ally after a Technique", "player_avatar"],
];

function sqlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

const companionRows = companions
  .filter(([name]) => !existing.has(slug(name)))
  .map(([name, klass, like], index) => {
    const id = slug(name);
    return `  (${sqlString(id)}, ${sqlString(name)}, ${sqlString(gifts[like])}, ${sqlString(klass)}, ${100 + index}, 'player_avatar')`;
  });

const fantomonRows = fantomons.map(
  ([id, name, role, icon]) =>
    `  (${sqlString(id)}, ${sqlString(name)}, ${sqlString(role)}, ${sqlString(icon)})`,
);

const sql = `insert into public.companion_defs (id, name, gift_type, stats, sort_order, icon_key)
values
${companionRows.join(",\n")}
on conflict (id) do nothing;

insert into public.catalog_fantomons (id, name, role, icon_key)
values
${fantomonRows.join(",\n")}
on conflict (id) do update
set name = excluded.name, role = excluded.role, icon_key = excluded.icon_key;

notify pgrst, 'reload schema';
`;

fs.writeFileSync(
  "supabase/migrations/20261111140000_roster.sql",
  sql,
);

const catalog = JSON.parse(fs.readFileSync("src/shared/config/catalog.json", "utf8"));
const have = new Set(catalog.companions.map((item) => item.id));
let order = 100;
for (const [name, klass, like] of companions) {
  const id = slug(name);
  if (have.has(id) || existing.has(id)) continue;
  catalog.companions.push({
    id,
    name,
    gift_type: gifts[like],
    stats: klass,
    sort_order: order,
    icon_key: "player_avatar",
  });
  order += 1;
}
catalog.fantomons = fantomons.map(([id, name, role, icon_key]) => ({
  id,
  name,
  role,
  icon_key,
}));
fs.writeFileSync("src/shared/config/catalog.json", `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`companions +${order - 100}, fantomons ${fantomons.length}`);
