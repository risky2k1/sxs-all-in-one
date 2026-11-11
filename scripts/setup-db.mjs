import fs from "node:fs";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

loadEnv(".env.local");
if (
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_ANON_KEY
) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  fs.appendFileSync(
    ".env.local",
    `\nNEXT_PUBLIC_SUPABASE_ANON_KEY="${process.env.SUPABASE_ANON_KEY}"\n`,
  );
}

const dbUrl = new URL(process.env.POSTGRES_URL_NON_POOLING);
dbUrl.searchParams.delete("sslmode");
const client = new pg.Client({
  connectionString: dbUrl.toString(),
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(
  fs.readFileSync("supabase/migrations/20261111000000_init.sql", "utf8"),
);
await client.end();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
const catalog = JSON.parse(
  fs.readFileSync("src/shared/config/catalog.json", "utf8"),
);
const assets = await admin
  .from("catalog_assets")
  .upsert(catalog.assets, { onConflict: "key" });
if (assets.error) throw assets.error;
const skills = await admin
  .from("catalog_skills")
  .upsert(catalog.skills, { onConflict: "id" });
if (skills.error) throw skills.error;
const companions = await admin
  .from("companion_defs")
  .upsert(catalog.companions, { onConflict: "id" });
if (companions.error) throw companions.error;
const fantomons = await admin
  .from("catalog_fantomons")
  .upsert(catalog.fantomons, { onConflict: "id" });
if (fantomons.error) throw fantomons.error;
console.log(
  `seeded ${catalog.skills.length} skills, ${catalog.assets.length} assets`,
);
