// Pages Function: /fetch
// Returns all stories ordered by newest first

export async function onRequest(context) {
  const { env } = context;
  try {
    // Query the D1 database. .all() returns { results: [...] }
    const res = await env.DB.prepare('SELECT id, content, created_at FROM stories ORDER BY created_at DESC').all();
    return new Response(JSON.stringify(res && res.results ? res.results : []), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err && err.message ? err.message : err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
