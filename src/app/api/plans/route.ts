import initSqlJs from "sql.js";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  let db:
    | InstanceType<Awaited<ReturnType<typeof initSqlJs>>["Database"]>
    | undefined;

  try {
    const dbPath = path.join(process.cwd(), "data", "globesim.sqlite");

    if (!fs.existsSync(dbPath)) {
      return Response.json(
        { error: "قاعدة البيانات ما لقاينهاش" },
        { status: 500 }
      );
    }

    const SQL = await initSqlJs({
      locateFile: (file) =>
        path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });

    db = new SQL.Database(fs.readFileSync(dbPath));

    const countryResult = db.exec(
      "SELECT slug, name, flag FROM countries ORDER BY id"
    );

    const planResult = db.exec(`
      SELECT
        id,
        country_slug,
        data_gb,
        days,
        price,
        currency,
        provider,
        provider_plan_id,
        availability_status,
        last_synced_at,
        is_illustrative
      FROM plans
      ORDER BY id
    `);

    const countries = (countryResult[0]?.values ?? []).map(
      ([slug, name, flag]) => ({ slug, name, flag })
    );

    const plans = (planResult[0]?.values ?? []).map(
      ([
        id,
        country_slug,
        data_gb,
        days,
        price,
        currency,
        provider,
        provider_plan_id,
        availability_status,
        last_synced_at,
        is_illustrative,
      ]) => ({
        id,
        country_slug,
        data_gb,
        days,
        price,
        currency,
        provider,
        providerPlanId: provider_plan_id,
        availabilityStatus: availability_status,
        lastSyncedAt: last_synced_at,
        isIllustrative: Boolean(is_illustrative),
      })
    );

    return Response.json({ countries, plans });
  } catch (error) {
    const detail =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    console.error("GlobeSIM API error:", detail);

    return Response.json(
      {
        error: "وقع مشكل فقراءة قاعدة البيانات",
        detail,
      },
      { status: 500 }
    );
  } finally {
    db?.close();
  }
}
