import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "globesim.sqlite");

fs.mkdirSync(dataDir, { recursive: true });

const SQL = await initSqlJs({
  locateFile: (file) =>
    path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
});

const db = fs.existsSync(dbPath)
  ? new SQL.Database(fs.readFileSync(dbPath))
  : new SQL.Database();

try {
  db.run(`
    CREATE TABLE IF NOT EXISTS countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      flag TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_slug TEXT NOT NULL,
      data_gb INTEGER NOT NULL,
      days INTEGER NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'MAD',
      FOREIGN KEY (country_slug) REFERENCES countries(slug)
    );
  `);

  // Add provider columns safely to existing databases.
  const existingColumns = new Set(
    db.exec("PRAGMA table_info(plans)")[0].values.map(
      (column) => column[1]
    )
  );

  const migrations = [
    ["provider", "TEXT NOT NULL DEFAULT 'local'"],
    ["provider_plan_id", "TEXT"],
    ["availability_status", "TEXT NOT NULL DEFAULT 'illustrative'"],
    ["last_synced_at", "TEXT"],
    ["is_illustrative", "INTEGER NOT NULL DEFAULT 1"],
  ];

  for (const [name, definition] of migrations) {
    if (!existingColumns.has(name)) {
      db.run(`ALTER TABLE plans ADD COLUMN ${name} ${definition}`);
      console.log(`Added missing column: ${name}`);
    }
  }

  const countries = [
    ["morocco", "المغرب", "🇲🇦"],
    ["spain", "إسبانيا", "🇪🇸"],
    ["france", "فرنسا", "🇫🇷"],
    ["turkey", "تركيا", "🇹🇷"],
    ["united-states", "الولايات المتحدة", "🇺🇸"],
    ["united-arab-emirates", "الإمارات", "🇦🇪"],
  ];

  const insertCountry = db.prepare(
    "INSERT OR IGNORE INTO countries (slug, name, flag) VALUES (?, ?, ?)"
  );

  for (const country of countries) {
    insertCountry.run(country);
  }
  insertCountry.free();

  const plans = [
    ["morocco", 5, 7, 49, "MAD"],
    ["spain", 5, 7, 59, "MAD"],
    ["france", 5, 7, 59, "MAD"],
    ["turkey", 5, 7, 69, "MAD"],
    ["united-states", 5, 7, 89, "MAD"],
    ["united-arab-emirates", 5, 7, 79, "MAD"],
  ];

  const insertPlan = db.prepare(`
    INSERT INTO plans (country_slug, data_gb, days, price, currency)
    SELECT ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM plans
      WHERE country_slug = ? AND data_gb = ? AND days = ?
    )
  `);

  for (const plan of plans) {
    insertPlan.run([...plan, plan[0], plan[1], plan[2]]);
  }
  insertPlan.free();

  // Preserve the illustrative status of local demo plans.
  db.run(`
    UPDATE plans
    SET provider = 'local',
        availability_status = 'illustrative',
        is_illustrative = 1
    WHERE provider = 'local'
  `);

  fs.writeFileSync(dbPath, Buffer.from(db.export()));

  console.log("GlobeSIM database initialized successfully.");
  console.log(`Database: ${dbPath}`);
  console.log(`Countries: ${db.exec("SELECT COUNT(*) FROM countries")[0].values[0][0]}`);
  console.log(`Plans: ${db.exec("SELECT COUNT(*) FROM plans")[0].values[0][0]}`);
} finally {
  db.close();
}
