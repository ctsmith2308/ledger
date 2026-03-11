import Fastify from 'fastify'

const server = Fastify({ logger: true })

const CORE_API_URL = process.env.CORE_API_URL ?? 'http://localhost:3001'

// Server Start
const port = Number(process.env.PORT ?? 3000)

server.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
})

// Health Check
server.get('/health', async (req, reply) => {
  try {
    const res = await fetch(`${CORE_API_URL}/health`);

    const coreApi = await res.json();

    return reply.send({
      status: 'ok',
      service: 'api-gateway',
      upstream: coreApi,
    });
  } catch {
    return reply.status(503).send({
      status: 'error',
      service: 'api-gateway',
      upstream: 'unreachable',
    });
  }
});

// Core-Api
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

