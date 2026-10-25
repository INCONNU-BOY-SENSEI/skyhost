import pg from "pg";

export const dynamic = "force-dynamic";

let pool;
function db() {
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

async function visit() {
  if (!process.env.DATABASE_URL) return { error: "DATABASE_URL is not set: connect a PostgreSQL database to this service." };
  try {
    await db().query("create table if not exists visits (id serial primary key, at timestamptz not null default now())");
    await db().query("insert into visits default values");
    const { rows } = await db().query("select count(*)::int as n, version() as v from visits");
    return { count: rows[0].n, version: rows[0].v.split(" ").slice(0, 2).join(" ") };
  } catch (e) {
    return { error: e.message };
  }
}

export default async function Home() {
  const r = await visit();
  return (
    <main>
      <h1>Next.js + PostgreSQL</h1>
      {r.error ? <p style={{ color: "#b91c1c" }}>{r.error}</p> : <p>This page was visited <strong>{r.count}</strong> times ({r.version}).</p>}
      <p>Edit <code>app/page.js</code> and push: SKYHOST redeploys automatically.</p>
    </main>
  );
}
