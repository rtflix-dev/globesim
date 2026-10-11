import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "globesim.sqlite");
const backupDir = path.join(process.cwd(), "data", "backups");

if (!fs.existsSync(dbPath)) {
  throw new Error("قاعدة البيانات ما لقاينهاش؛ ما تبدّل والو.");
}

fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(
  backupDir,
  `globesim-before-provider-migration-${stamp}.sqlite`
);

fs.copyFileSync(dbPath, backupPath);

const SQL = await initSqlJs({
  locateFile: (file) =>
    path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
});

const db = new SQL.Database(fs.readFileSync(dbPath));
let transactionStarted = false;

const newColumns = [
  ["provider", "TEXT NOT NULL DEFAULT 'local'"],
  ["provider_plan_id", "TEXT"],
  ["availability_status", "TEXT NOT NULL DEFAULT 'illustrative'"],
  ["last_synced_at", "TEXT"],
  ["is_illustrative", "INTEGER NOT NULL DEFAULT 1"],
];

try {
  const table = db.exec("PRAGMA table_info(plans)");

  if (!table.length || !table[0].values.length) {
    throw new Error("جدول plans ما تلقاش.");
  }

  const existing = new Set(table[0].values.map((row) => row[1]));
  const added = [];

  db.run("BEGIN TRANSACTION");
  transactionStarted = true;

  for (const [name, definition] of newColumns) {
    if (!existing.has(name)) {
      db.run(`ALTER TABLE plans ADD COLUMN ${name} ${definition}`);
      added.push(name);
    }
  }

  db.run("COMMIT");
  transactionStarted = false;

  // مهم: التصدير كيكون من بعد COMMIT، ماشي قبله.
  const tempPath = `${dbPath}.migration-tmp`;
  fs.writeFileSync(tempPath, Buffer.from(db.export()));
  fs.renameSync(tempPath, dbPath);

  console.log("نجاح: سالات Migration ديال الباقات.");
  console.log(
    "الحقول المضافة:",
    added.length ? added.join(", ") : "كل الحقول موجودة"
  );
  console.log("النسخة الاحتياطية:", backupPath);
  console.log("البيانات والأثمنة القديمة ما تبدلوش.");
} catch (error) {
  if (transactionStarted) {
    try {
      db.run("ROLLBACK");
    } catch {}
  }

  throw error;
} finally {
  try {
    db.close();
  } catch {}
}
