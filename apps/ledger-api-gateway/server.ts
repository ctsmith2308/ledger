import Fastify from 'fastify'

const server = Fastify({ logger: true })

const CORE_API_URL = process.env.CORE_API_URL ?? 'http://localhost:3001'

// ── Health check ─────────────────────────────────────────────────────────────
server.get('/health', async () => {
  return { status: 'ok', service: 'api-gateway' }
})

// ── Proxy: everything under /api → core-api ───────────────────────────────
// This is the bare minimum to prove the services talk.
// In Phase 1 this becomes proper route-by-route forwarding with JWT middleware.
server.get('/api/*', async (request, reply) => {
  const path = (request.params as any)['*'];

  const upstream = await fetch(`${CORE_API_URL}/${path}`);

  const body = await upstream.json();
  
  reply.status(upstream.status).send(body)
})

server.post('/api/*', async (request, reply) => {
  const path = (request.params as any)['*'];

  const upstream = await fetch(`${CORE_API_URL}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request.body),
  });

  const body = await upstream.json();

  reply.status(upstream.status).send(body)
})

// ── Start ─────────────────────────────────────────────────────────────────────
const port = Number(process.env.PORT ?? 3000)

server.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})
