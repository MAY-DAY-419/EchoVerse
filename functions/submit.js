// Pages Function: /submit
// Accepts POST { content: "..." } and inserts into D1 using env.DB.prepare(...).run()

export async function onRequest(context) {
  const { request, env } = context;
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const content = (body && body.content || '').trim();
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Insert into D1. If the table doesn't exist yet, this will error until you apply schema.sql.
    const stmt = env.echoverse_db.prepare('INSERT INTO stories (content) VALUES (?)');
    const result = await stmt.bind(content).run();

    // lastInsertRowid is returned by D1 results when insertion is successful
    return new Response(JSON.stringify({ success: true, id: result && result.lastInsertRowid ? result.lastInsertRowid : null }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err && err.message ? err.message : err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
