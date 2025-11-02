// Pages Function: /dbstatus
// Helper to inspect which tables exist in the connected D1 database.
// Useful for debugging connectivity when you haven't applied schema.sql yet.

export async function onRequest(context) {
  const { env } = context;
  try {
    // Query sqlite_master to see tables/indexes present
    const res = await env.DB.prepare("SELECT name, type FROM sqlite_master WHERE type IN ('table','index')").all();
    return new Response(JSON.stringify({ ok: true, objects: res && res.results ? res.results : [] }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err && err.message ? err.message : err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
